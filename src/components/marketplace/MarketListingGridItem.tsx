import React from 'react'
import Image from 'next/image'
import {
  FiEdit,
  FiHeart,
  FiMessageCircle,
  FiShoppingCart,
  FiTrash2,
} from 'react-icons/fi'
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
  onBuy,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className='text-left bg-background-light w-full border-2 border-foreground/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-[500px] flex flex-col'
      onClick={onClick}
    >
      {/* Item image - fixed height */}
      <div className='h-48 bg-foreground/5 overflow-hidden flex-shrink-0'>
        {listing.pictures.length > 0 ? (
          <Image
            src={listing.pictures[0]}
            width={300}
            height={192}
            className='object-cover w-full h-full bg-foreground/5'
            alt='Market listing picture'
          />
        ) : (
          <div className='h-full flex items-center justify-center'>
            <span className='text-foreground/30'>Item Image</span>
          </div>
        )}
      </div>

      <div className='p-4 flex flex-col flex-grow'>
        <div className='flex justify-between items-start'>
          <h3
            className='font-medium truncate max-w-[85%]'
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

        <p className='text-lg font-mono font-bold mt-1'>
          {formatCurrency(listing.priceInCents)}
        </p>

        <div className='flex items-center text-sm mt-1 text-foreground/70'>
          <span className='flex items-center'>★ {0}</span>
          <span className='mx-1'>•</span>
          <span>{0} reviews</span>
        </div>

        <p className='text-sm mt-1 text-foreground/70 line-clamp-1'>
          Seller: {listing.author.username ?? listing.author.id.toString()}
        </p>

        {/* Add description with line clamp */}
        <p className='text-sm mt-2 text-foreground/70 line-clamp-2 flex-grow'>
          {listing.description}
        </p>

        {/* Push buttons to the bottom with mt-auto */}
        <div className='flex flex-col mt-auto pt-4'>
          <span className='text-xs text-foreground/50 mb-3'>
            Listed: {dayjs(listing.listedAt).fromNow()}
          </span>
          <div className='flex justify-between gap-4'>
            {/* Only show chat button for listings where user is not the seller */}
            {!isMine ? (
              <>
                <div className='flex-1' />

                <button
                  className='button py-1.5 px-3 h-auto flex items-center gap-1 flex-1 justify-center'
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
                  className='button py-1.5 !border-red-500 px-3 h-auto flex items-center gap-1 flex-1 justify-center text-red-500'
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering parent onClick
                    onDelete?.()
                  }}
                >
                  <FiTrash2 size={14} />
                  <span>Delete</span>
                </button>

                <button
                  className='button-shape bg-amber-400 hover:bg-amber-500 text-black flex-1 gap-1'
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
