import React from 'react'

import type { ClientMarketListingChatMessage } from '@/data/types/chats'
import ChatMessage from './ChatMessage'

export interface ShimmerChatMarketListingMessageProps {
  message: ClientMarketListingChatMessage
  isMe?: boolean
}

const ShimmerChatMarketListingMessage: React.FC<
  ShimmerChatMarketListingMessageProps
> = ({ message, isMe = false }) => {
  return (
    <div>
      <ChatMessage isMe={isMe} sentAt={message.sentAt}>
        <div className='flex min-w-72 flex-row flex-nowrap items-start gap-2'>
          <div className='size-24 animate-pulse rounded-l-md bg-foreground-light' />

          <div className='h-full flex-1 space-y-2 py-2 pr-4'>
            <div className='h-4 w-12 animate-pulse rounded bg-foreground-light' />
            <div className='h-4 w-16 animate-pulse rounded bg-foreground-light' />

            <div className='mt-2 h-6 w-12 animate-pulse rounded bg-foreground-light' />
            <div className='h-2 w-8 animate-pulse rounded bg-foreground-light' />
          </div>
        </div>
      </ChatMessage>
    </div>
  )
}

export default ShimmerChatMarketListingMessage
