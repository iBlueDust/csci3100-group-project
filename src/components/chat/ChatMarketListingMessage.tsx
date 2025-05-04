import React from 'react'
import Image from 'next/image'

import type { BaseClientChatMessage } from '@/data/types/chats'
import { formatCurrency } from '@/utils/format'
import ChatMessage from './ChatMessage'
import { MarketListingSearchResult } from '@/data/db/mongo/queries/market'

export interface ClientChatMarketListingMessage extends BaseClientChatMessage {
  type: 'market-listing'
  content: MarketListingSearchResult
}

export interface ChatMarketListingMessageProps {
  message: ClientChatMarketListingMessage
  isMe?: boolean
}

const ChatMarketListingMessage: React.FC<ChatMarketListingMessageProps> = ({
  message,
  isMe = false,
}) => {
  return (
    <div className=''>
      <ChatMessage isMe={isMe} sentAt={message.sentAt}>
        <div className='flex min-w-72 flex-row flex-nowrap items-start gap-2'>
          {message.content.pictures.length > 0 ? (
            <Image
              width={96}
              height={96}
              src={message.content.pictures[0]}
              alt='Market Listing Image'
              className='inline-block size-24 rounded-l bg-background-dark object-cover'
            />
          ) : (
            <div className='size-20 bg-foreground/5 align-middle text-xs text-foreground/30'>
              Item Image
            </div>
          )}

          <div className='h-full flex-1 py-2 pr-4'>
            <p className='text-sm font-medium text-foreground'>
              {message.content.title}
            </p>
            <p className='truncate text-xs text-foreground'>
              {message.content.description}
            </p>

            <p className='mt-2 font-mono text-sm font-bold text-foreground'>
              {formatCurrency(message.content.priceInCents)}
            </p>
            <p className='truncate text-xs text-foreground-light'>
              by{' '}
              {message.content.author.username ??
                message.content.author.id.toString()}
            </p>
          </div>
        </div>
      </ChatMessage>
    </div>
  )
}

export default ChatMarketListingMessage
