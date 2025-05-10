import React from 'react'
import Image from 'next/image'
import { FiEdit, FiHeart, FiMessageCircle, FiTrash2 } from 'react-icons/fi'
import classNames from 'classnames'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import type { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { formatCurrency } from '@/utils/format'

export interface MarketListingGridListItemProps {
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

const MarketListingGridListItem: React.FC<MarketListingGridListItemProps> = ({
  listing,
  isFavorite = false,
  isMine = false,
  onClick,
  onFavorite,
  onUnfavorite,
  onChat,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className='flex h-[490px] w-full cursor-pointer flex-col overflow-hidden rounded-lg border-2 border-foreground/10 bg-background-light text-left shadow-sm transition-shadow hover:shadow-md'
      onClick={onClick}
    >
      {/* Item image - fixed height */}
      <div className='h-48 shrink-0 overflow-hidden bg-foreground/5'>
        {listing.pictures.length > 0 ? (
          <Image
            src={listing.pictures[0]}
            width={300}
            height={192}
            className='size-full bg-foreground/5 object-cover'
            alt='Market listing picture'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <span className='text-foreground/30'>Item Image</span>
          </div>
        )}
      </div>

      <div className='flex grow flex-col p-4'>
        <div className='flex items-start justify-between'>
          <h3
            className='max-w-[85%] truncate font-medium'
            title={listing.title}
          >
            {listing.title}
          </h3>
          <button
            className={classNames(
              'flex-shrink-0',
              isFavorite
                ? 'text-red-500'
                : 'text-foreground/50 hover:text-red-500',
            )}
            title='Add to favorites'
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering parent onClick
              // Add to favorites logic
              if (isFavorite) {
                onUnfavorite?.()
              } else {
                onFavorite?.()
              }
            }}
          >
            <FiHeart className={isFavorite ? 'fill-current' : ''} />
          </button>
        </div>

        <p className='mt-1 font-mono text-lg font-bold'>
          {formatCurrency(listing.priceInCents)}
        </p>

        <div className='mt-1 flex items-center text-sm text-foreground/70'>
          <span className='flex items-center'>★ {0}</span>
          <span className='mx-1'>•</span>
          <span>{0} reviews</span>
        </div>

        <p className='mt-1 line-clamp-1 text-sm text-foreground/70'>
          Seller: {listing.author.username ?? listing.author.id.toString()}
        </p>

        {/* Add description with line clamp */}
        <p className='mt-2 line-clamp-3 grow text-sm text-foreground/70'>
          {listing.description
            .split('\n')
            .slice(0, 4)
            .map((line, i) => [i > 0 && <br />, line])
            .flat()}
        </p>

        {/* Push buttons to the bottom with mt-auto */}
        <div className='mt-auto flex flex-col pt-4'>
          <span className='mb-3 text-xs text-foreground/50'>
            Listed: {dayjs(listing.listedAt).fromNow()}
          </span>
          <div className='flex justify-between gap-4'>
            {/* Only show chat button for listings where user is not the seller */}
            {!isMine ? (
              <>
                <div className='flex-1' />

                <button
                  className='button-primary flex-1 gap-1'
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering parent onClick
                    onChat?.()
                  }}
                >
                  <FiMessageCircle size={14} />
                  <span>Chat</span>
                </button>

                {/* <button
                  className='button-primary py-1.5 px-3 h-auto flex items-center gap-1 flex-1 justify-center'
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering parent onClick
                    onBuy?.()
                  }}
                >
                  <FiShoppingCart size={14} />
                  <span>Buy</span>
                </button> */}
              </>
            ) : (
              <>
                <button
                  className='button flex h-auto flex-1 items-center justify-center gap-1 !border-red-500 px-3 py-1.5 text-red-500'
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering parent onClick
                    onDelete?.()
                  }}
                >
                  <FiTrash2 size={14} />
                  <span>Delete</span>
                </button>

                <button
                  className='button-shape flex-1 gap-1 bg-amber-400 text-black hover:bg-amber-500'
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
      </div>
    </div>
  )
}

export default MarketListingGridListItem
