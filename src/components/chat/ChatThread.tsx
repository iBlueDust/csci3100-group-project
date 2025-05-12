import React, { useCallback, useLayoutEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

import { ChatMessageType, ClientChatMessage } from '@/data/types/chats'
import { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { PostChatMessagePayload } from '@/data/frontend/fetches/postChatMessage'
import { isSupportedImage } from '@/utils'
import { useApi } from '@/utils/frontend/api'

import ChatInput from './ChatInput'
import ChatTextMessage from './ChatTextMessage'
const ChatImageMessage = dynamic(() => import('./ChatImageMessage'))
const ChatAttachmentMessage = dynamic(() => import('./ChatAttachmentMessage'))
const ChatMarketListingMessage = dynamic(
  () => import('./ChatMarketListingMessage'),
)
const ChatRecipientLeftBanner = dynamic(
  () => import('./ChatRecipientLeftBanner'),
)

export interface ChatThreadProps {
  messages: ClientChatMessage[]
  sharedKey: CryptoKey
  wasRequestedToDelete?: boolean
  initialPreviewMarketListing?: MarketListingSearchResult
  onSend?: (message: PostChatMessagePayload) => Promise<boolean>
  onDeleteChat?: () => void
}

const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  sharedKey,
  wasRequestedToDelete = false,
  initialPreviewMarketListing,
  onSend,
  onDeleteChat,
}) => {
  const api = useApi()

  const scrollHelperRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    scrollHelperRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages, scrollHelperRef])

  useLayoutEffect(() => {
    scrollHelperRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [])

  const handleSend = useCallback(
    async (
      message: string,
      attachment?:
        | { type: 'general'; value: File }
        | { type: 'market-listing'; value: MarketListingSearchResult },
    ) => {
      if (!message.trim() && !attachment) {
        console.warn('Message input is empty')
        return false
      }

      if (!api.user) {
        console.warn('User is not yet authenticated')
        return false
      }

      let payload: PostChatMessagePayload
      if (!attachment) {
        payload = {
          type: ChatMessageType.Text,
          content: message,
        }
      } else if (attachment.type === 'market-listing') {
        payload = {
          type: ChatMessageType.MarketListing,
          content: attachment.value.id.toString(),
        }
      } else if (attachment.type === 'general') {
        payload = {
          type: ChatMessageType.Attachment,
          content: await attachment.value.arrayBuffer(),
          contentFilename: attachment.value.name,
        }
      } else {
        throw new Error('Invalid attachment type')
      }

      if (!onSend) {
        return true
      }

      return onSend(payload)
    },
    [api.user, onSend],
  )

  /* Container for mobile that includes both the banner and messages with a single scroll */
  return (
    <div className='scroll-thin relative h-full overflow-y-auto'>
      <div className='flex min-h-full flex-col flex-nowrap'>
        {/* Deletion banner */}
        {wasRequestedToDelete && (
          <div className='sticky top-0 z-10'>
            <ChatRecipientLeftBanner onDelete={onDeleteChat} />
          </div>
        )}

        {/* Messages */}
        {messages && messages.length > 0 ? (
          <div className='mt-auto space-y-4 p-4'>
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

              if (message.type === ChatMessageType.MarketListing) {
                return (
                  <ChatMarketListingMessage
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
          <div className='flex flex-1 items-center justify-center'>
            <p className='text-center text-2xl text-foreground-light/50'>
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
          <ChatInput
            wasRequestedToDelete={wasRequestedToDelete}
            initialPreviewMarketListing={initialPreviewMarketListing}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatThread
