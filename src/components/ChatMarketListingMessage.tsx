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
    <ChatMessage isMe={isMe} sentAt={message.sentAt}>
      <div className='bg-background-light rounded p-2 space-y-1'>
        <div className='flex justify-between'>
          <p className='text-sm font-medium text-foreground mr-4'>
            {message.content.title}
          </p>
          <p className='text-sm font-mono font-bold text-foreground'>
            {formatCurrency(message.content.priceInCents)}
          </p>
        </div>

        {message.content.pictures.length > 0 ? (
          <div className='h-16'>
            <Image
              width={128}
              height={64}
              src={message.content.pictures[0]}
              alt='Market Listing Image'
            />
          </div>
        ) : (
          <div className='h-16 bg-foreground/5 flex items-center justify-center text-xs text-foreground/30'>
            Item Image
          </div>
        )}
        <p className='text-xs text-foreground'>{message.content.description}</p>
      </div>
    </ChatMessage>
  )
}

export default ChatMarketListingMessage
