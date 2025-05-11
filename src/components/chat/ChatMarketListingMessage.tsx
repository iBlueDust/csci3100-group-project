import React from 'react'
import Image from 'next/image'

import type { ClientMarketListingChatMessage } from '@/data/types/chats'
import type { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { formatCurrency } from '@/utils/format'
import ChatMessage from './ChatMessage'
import dynamic from 'next/dynamic'
import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/data/types/queries'
import { useApi } from '@/utils/frontend/api'
import { queryMarketListingById } from '@/data/frontend/queries/queryMarketListingById'

const ShimmerChatMarketListingMessage = dynamic(
  () => import('./ShimmerChatMarketListingMessage'),
  {
    ssr: false,
  },
)

export interface ChatMarketListingMessageProps {
  message: ClientMarketListingChatMessage
  isMe?: boolean
}

const ChatMarketListingMessage: React.FC<ChatMarketListingMessageProps> = ({
  message,
  isMe = false,
}) => {
  const api = useApi()

  const { data: listing } = useQuery<MarketListingSearchResult>({
    queryKey: [QueryKeys.MARKET_LISTINGS, message.content],
    queryFn: () => queryMarketListingById(api, message.content),
    enabled: !!message.content,
  })

  if (!listing) {
    return <ShimmerChatMarketListingMessage message={message} isMe={isMe} />
  }

  return (
    <div>
      <ChatMessage isMe={isMe} sentAt={message.sentAt}>
        <div className='flex min-w-72 flex-row flex-nowrap items-start gap-2'>
          {listing.pictures.length > 0 ? (
            <Image
              width={96}
              height={96}
              src={listing.pictures[0]}
              alt='Market Listing Image'
              className='inline-block size-24 rounded-l bg-background-dark object-cover'
            />
          ) : (
            <div className='size-24 bg-foreground/5 align-middle text-xs text-foreground/30'>
              Item Image
            </div>
          )}

          <div className='h-full w-44 flex-1 py-2 pr-4'>
            <p className='line-clamp-1 text-sm font-medium text-foreground'>
              {listing.title}
            </p>
            <p className='line-clamp-1 text-xs text-foreground'>
              {listing.description}
            </p>

            <p className='mt-2 font-mono text-sm font-bold text-foreground'>
              {formatCurrency(listing.priceInCents)}
            </p>
            <p className='truncate text-xs text-foreground-light'>
              by {listing.author.username ?? listing.author.id.toString()}
            </p>
          </div>
        </div>
      </ChatMessage>
    </div>
  )
}

export default ChatMarketListingMessage
