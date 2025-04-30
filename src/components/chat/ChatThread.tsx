import React, { useLayoutEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

import {
  ChatMessageType,
  ClientChat,
  ClientChatMessage,
} from '@/data/types/chats'
import { isSupportedImage } from '@/utils'
import { useApi } from '@/utils/frontend/api'
import ChatInput from './ChatInput'
import ChatTextMessage from './ChatTextMessage'
import type { ClientChatMarketListingMessage } from './ChatMarketListingMessage'
const ChatImageMessage = dynamic(() => import('./ChatImageMessage'))
const ChatAttachmentMessage = dynamic(() => import('./ChatAttachmentMessage'))
const ChatRecipientLeftBanner = dynamic(
  () => import('./ChatRecipientLeftBanner'),
)

export interface ChatThreadProps {
  chat: Pick<ClientChat, 'wasRequestedToDelete'>
  messages: (ClientChatMessage | ClientChatMarketListingMessage)[] | undefined
  sharedKey: CryptoKey
  onSend: (message: string, attachment: File | null) => Promise<boolean>
  onDeleteChat?: () => void
}

const ChatThread: React.FC<ChatThreadProps> = ({
  chat,
  messages,
  sharedKey,
  onSend,
  onDeleteChat,
}) => {
  const api = useApi()

  const scrollHelperRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    scrollHelperRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages, scrollHelperRef])

  /* Container for mobile that includes both the banner and messages with a single scroll */
  return (
    <div className='relative overflow-y-auto scroll-thin'>
      <div className='flex flex-col min-h-full flex-nowrap'>
        {/* Deletion banner */}
        {chat.wasRequestedToDelete && (
          <div className='sticky top-0 z-10'>
            <ChatRecipientLeftBanner onDelete={onDeleteChat} />
          </div>
        )}

        {/* Messages */}
        <div className='mt-auto p-4 space-y-4'>
          {messages?.map((message) => {
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
              if (isSupportedImage(message.content)) {
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
                  sharedKey={sharedKey}
                />
              )
            }
          })}

          <div ref={scrollHelperRef} />
        </div>

        {/* Message Input - Fixed at bottom for mobile */}
        <div className='sticky bottom-0'>
          <ChatInput onSend={onSend} />
        </div>
      </div>
    </div>
  )
}

export default ChatThread
