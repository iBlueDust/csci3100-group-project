import React, { useCallback, useLayoutEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

import {
  ChatMessageType,
  ClientChat,
  ClientChatMessage,
} from '@/data/types/chats'
import type { PostChatMessagePayload } from '@/data/frontend/fetches/postChatMessage'
import { QueryKeys } from '@/data/types/queries'
import { useApi } from '@/utils/frontend/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedResult } from '@/data/types/common'
import { queryChatMessages } from '@/data/frontend/queries/queryChatMessages'
import { isDev } from '@/utils/frontend/env'
import { sendChatMessage } from '@/data/frontend/mutations/sendChatMessage'

import ChatInput from './ChatInput'
import ChatTextMessage from './ChatTextMessage'
const ChatImageMessage = dynamic(() => import('./ChatImageMessage'))
const ChatAttachmentMessage = dynamic(() => import('./ChatAttachmentMessage'))
const ChatRecipientLeftBanner = dynamic(
  () => import('./ChatRecipientLeftBanner'),
)

export interface ChatThreadProps {
  chat: ClientChat
  sharedKey: CryptoKey
  onDeleteChat?: () => void
}

const ChatThread: React.FC<ChatThreadProps> = ({
  chat,
  sharedKey,
  onDeleteChat,
}) => {
  const api = useApi()
  const queryClient = useQueryClient()

  const { data: messages } = useQuery<PaginatedResult<ClientChatMessage>>({
    queryKey: [QueryKeys.CHAT_MESSAGES, chat.id],
    queryFn: async () => queryChatMessages(api, chat.id, sharedKey),
    throwOnError: isDev,
    enabled: !!api.user && !!sharedKey,
  })

  const mutation = useMutation({
    mutationFn: async (arg: PostChatMessagePayload<string>) =>
      sendChatMessage(api, chat.id, arg, sharedKey),
    onSuccess: () => {
      // Reload chat messages
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CHAT_MESSAGES, chat.id],
      })
    },
  })

  const scrollHelperRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = useCallback(
    async (message: string, attachment: File | null) => {
      if (!message.trim() && !attachment) {
        console.warn('Message input is empty')
        return false
      }

      if (!api.user) {
        console.warn('User is not yet authenticated')
        return false
      }

      // In a real app, you would send the message to an API
      const messagePayload: PostChatMessagePayload<string> = {
        type: ChatMessageType.Text,
        content: message,
      }

      try {
        await mutation.mutateAsync(messagePayload)
      } catch (error) {
        console.error('Error sending message:', error)
      }

      return true
    },
    [api, mutation],
  )

  useLayoutEffect(() => {
    scrollHelperRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [chat, scrollHelperRef])

  /* Container for mobile that includes both the banner and messages with a single scroll */
  return (
    <div className='relative overflow-y-auto scroll-thin'>
      <div className='flex flex-col min-h-full flex-nowrap'>
        {/* Deletion banner */}
        {chat.wasRequestedToDelete ||
          (true && (
            <div className='sticky top-0 z-10'>
              <ChatRecipientLeftBanner onDelete={onDeleteChat} />
            </div>
          ))}

        {/* Messages */}
        <div className='mt-auto p-4 space-y-4'>
          {messages?.data.map((message) => {
            if (message.type === ChatMessageType.Text) {
              return (
                <ChatTextMessage
                  key={message.id}
                  message={message}
                  isMe={message.sender === api.user?.id}
                />
              )
            }

            if (message.type === ChatMessageType.Attachment) {
              if (/\.(jpe?g|png|gif|webp)$/i.test(message.content.toString())) {
                return (
                  <ChatImageMessage
                    key={message.id}
                    message={message}
                    isMe={message.sender === api.user?.id}
                  />
                )
              }

              return (
                <ChatAttachmentMessage
                  key={message.id}
                  message={message}
                  isMe={message.sender === api.user?.id}
                />
              )
            }
          })}

          <div ref={scrollHelperRef} />
        </div>

        {/* Message Input - Fixed at bottom for mobile */}
        <div className='sticky bottom-0'>
          <ChatInput onSend={handleSendMessage} />
        </div>
      </div>
    </div>
  )
}

export default ChatThread
