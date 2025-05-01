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
import { useDragDrop } from '@/hooks/useDragDrop'
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
  const dragDrop = useDragDrop()

  useLayoutEffect(() => {
    scrollHelperRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages, scrollHelperRef])

  /* Container for mobile that includes both the banner and messages with a single scroll */
  return (
    <div
      ref={dragDrop.dropAreaRef}
      className='relative overflow-y-auto h-full scroll-thin'
    >
      <div className='flex flex-col min-h-full flex-nowrap'>
        {/* Deletion banner */}
        {chat.wasRequestedToDelete && (
          <div className='sticky top-0 z-10'>
            <ChatRecipientLeftBanner onDelete={onDeleteChat} />
          </div>
        )}

        {/* Messages */}
        {messages && messages.length > 0 ? (
          <div className='mt-auto p-4 space-y-4'>
            {messages.map((message) => {
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
                if (
                  message.contentFilename &&
                  isSupportedImage(message.contentFilename)
                ) {
                  return (
                    <ChatImageMessage
                      key={message.id}
                      message={message}
                      isMe={message.sender === api.user?.id}
                      sharedKey={sharedKey}
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
        ) : (
          <div className='flex-1 flex justify-center items-center'>
            <p className='text-center text-foreground-light/50 text-2xl'>
              {messages ? (
                <>
                  No messages yet
                  <br />
                  Send one now
                </>
              ) : (
                'Loading...'
              )}
            </p>
          </div>
        )}

        {/* Message Input - Fixed at bottom for mobile */}
        <div className='sticky bottom-0'>
          <ChatInput onSend={onSend} />
        </div>
      </div>

      {dragDrop.isDraggingOver && (
        <>
          <input
            className='absolute inset-0 opacity-0'
            type='file'
            multiple
            onChange={() => {}}
          />
          <div className='absolute inset-0 bg-sky-500/20 p-16'>
            <div className='border-2 border-sky-500 rounded-lg border-dash-2'>
              <p className='w-full h-full align-middle'>
                Release to drop files
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatThread
