import React from 'react'
import Image from 'next/image'
import {
  FiEdit,
  FiMessageCircle,
  FiShoppingCart,
  FiTrash2,
} from 'react-icons/fi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { formatCurrency } from '@/utils/format'

export interface MarketListingListItemProps {
  listing: MarketListingSearchResult
  isMine?: boolean
  isFavorite?: boolean
  onClick?: () => void
  onFavorite?: () => void
  onUnfavorite?: () => void
  onChat?: () => void
  onBuy?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const MarketListingListItem: React.FC<MarketListingListItemProps> = ({
  listing,
  isMine = false,
  onClick,
  onChat,
  onBuy,
  onEdit,
  onDelete,
}) => {
  return (
    <button
      key={listing.id.toString()}
      className='w-full text-left bg-background-light border-2 border-foreground/10 rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow'
      onClick={onClick}
    >
      {/* Item image */}
      <div className='h-24 w-24 bg-foreground/5 shrink-0 overflow-hidden'>
        {listing.pictures.length > 0 ? (
          <Image
            src={listing.pictures[0]}
            width={96}
            height={96}
            alt='Market listing picture'
            className='w-full h-full object-cover rounded-md'
          />
        ) : (
          <div className='h-full w-full flex items-center justify-center'>
            <span className='text-foreground/30'>Image</span>
          </div>
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex justify-between items-start'>
          <h3 className='font-medium'>{listing.title}</h3>
          <p className='text-lg font-mono font-bold'>
            {formatCurrency(listing.priceInCents)}
          </p>
        </div>

        <div className='flex mt-3 gap-4 flex-row flex-nowrap items-end'>
          <div>
            <p className='text-sm  mt-1 line-clamp-2 text-foreground/70'>
              {listing.description}
            </p>

            <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-2'>
              <span className='text-sm text-foreground/70'>
                Seller:{' '}
                {listing.author?.username ?? listing.author.id.toString()}
              </span>

              <span className='text-sm flex items-center text-foreground/70'>
                ★ {0} ({0} reviews)
              </span>

              <span className='text-sm text-foreground/70'>
                Location: {listing.countries.join(', ')}
              </span>

              <span className='text-sm text-foreground/70'>
                Listed: {dayjs(listing.listedAt).fromNow()}
              </span>
            </div>
          </div>

          <div className='flex-1'></div>

          {!isMine ? (
            <>
              <button
                className='button py-1.5 px-3 h-auto flex items-center gap-1 justify-center'
                onClick={(e) => {
                  e.stopPropagation() // Prevent triggering parent onClick
                  onChat?.()
                }}
              >
                <FiMessageCircle size={14} />
                <span>Chat</span>
              </button>

              <button
                className='button-primary py-1.5 px-3 h-auto flex items-center gap-1 justify-center'
                onClick={(e) => {
                  e.stopPropagation() // Prevent triggering parent onClick
                  onBuy?.()
                }}
              >
                <FiShoppingCart size={14} />
                <span>Buy</span>
              </button>
            </>
          ) : (
            <>
              <button
                className='button py-1.5 !border-red-500 px-3 h-auto flex items-center gap-1 justify-center text-red-500'
                onClick={(e) => {
                  e.stopPropagation() // Prevent triggering parent onClick
                  onDelete?.()
                }}
              >
                <FiTrash2 size={14} />
                <span>Delete</span>
              </button>

              <button
                className='button-primary py-1.5 px-3 h-auto flex items-center gap-1 justify-center'
                onClick={(e) => {
                  e.stopPropagation() // Prevent triggering parent onClick
                  onEdit?.()
                }}
              >
                <FiEdit size={14} />
                <span>Edit</span>
              </button>
            </>
          )}
        </div>
      </div>
    </button>
  )
}

export default MarketListingListItem
