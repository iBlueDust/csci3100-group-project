import React, { useCallback, useMemo } from 'react'
import { FiChevronLeft, FiTrash2 } from 'react-icons/fi'
import classNames from 'classnames'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import {
  ChatMessageType,
  ClientChatMessage,
  ClientChat,
} from '@/data/types/chats'
import { QueryKeys } from '@/data/types/queries'
import { sendChatMessage } from '@/data/frontend/mutations/sendChatMessage'
import type { PostChatMessagePayload } from '@/data/frontend/fetches/postChatMessage'
import { queryChatMessages } from '@/data/frontend/queries/queryChatMessages'
import type { PaginatedResult } from '@/data/types/common'
import { useApi } from '@/utils/frontend/api'
import { isDev } from '@/utils/frontend/env'
import ChatThread from './ChatThread'
import BasicSpinner from '../BasicSpinner'

export interface ChatBoxProps {
  className?: string
  chat: ClientChat
  sharedKey: CryptoKey
  isDeleting?: boolean
  onMobileCloseClick?: () => void
  onDeleteChat?: () => void
}

const ChatBox: React.FC<ChatBoxProps> = ({
  className,
  chat,
  sharedKey,
  isDeleting = false,
  onMobileCloseClick,
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
    mutationFn: async (arg: PostChatMessagePayload) =>
      sendChatMessage(api, chat.id, arg, sharedKey),
    onSuccess: () => {
      // Reload chat messages
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CHAT_MESSAGES, chat.id],
      })
    },
  })

  const otherParty = useMemo(
    () =>
      chat.participants.find((participant) => participant.id !== api.user?.id),
    [chat, api],
  )

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

      const payload: PostChatMessagePayload = !attachment
        ? {
            type: ChatMessageType.Text,
            content: message,
          }
        : {
            type: ChatMessageType.Attachment,
            content: await attachment.arrayBuffer(),
            contentFilename: attachment.name,
          }
      console.log({ payload })

      try {
        await mutation.mutateAsync(payload)
      } catch (error) {
        console.error('Error sending message:', error)
        return false
      }

      return true
    },
    [api, mutation],
  )

  return (
    <section className={classNames('flex flex-col flex-nowrap', className)}>
      {/* Chat Header */}
      <div className='min-h-16 h-16 flex items-center justify-between px-4 border-b border-foreground/10'>
        <div className='flex items-center gap-3'>
          <button
            className='md:hidden text-foreground/70'
            onClick={onMobileCloseClick}
          >
            <FiChevronLeft size={20} />
          </button>
          <div className='w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground'>
            {otherParty?.username.charAt(0).toUpperCase()}
          </div>
          <h3 className='font-medium'>{otherParty?.username}</h3>
        </div>

        <button
          className='h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 hover:text-red-500 transition-colors'
          onClick={onDeleteChat}
          disabled={isDeleting}
        >
          {!isDeleting ? (
            <FiTrash2 size={16} />
          ) : (
            <BasicSpinner className='w-4 h-4' />
          )}
        </button>
      </div>

      <ChatThread
        chat={chat}
        messages={messages?.data}
        sharedKey={sharedKey}
        onSend={handleSendMessage}
        onDeleteChat={onDeleteChat}
      />
      {/* </div> */}
    </section>
  )
}

export default ChatBox
