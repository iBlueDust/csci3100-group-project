import React, { useMemo } from 'react'
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
import { formatCurrency, formatTruncatedList } from '@/utils/format'
import { getCountryNameById } from '@/utils/countries'

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
  // isFavorite = false,
  isMine = false,
  onClick,
  // onFavorite,
  // onUnfavorite,
  onChat,
  onBuy,
  onEdit,
  onDelete,
}) => {
  const countries = useMemo(
    () => listing.countries.map((c) => c.toUpperCase()).map(getCountryNameById),
    [listing.countries],
  )

  return (
    <button
      key={listing.id.toString()}
      className='flex w-full gap-4 rounded-lg border-2 border-foreground/10 bg-background-light p-4 text-left transition-shadow hover:shadow-md'
      onClick={onClick}
    >
      {/* Item image */}
      <div className='size-24 shrink-0 overflow-hidden bg-foreground/5'>
        {listing.pictures.length > 0 ? (
          <Image
            src={listing.pictures[0]}
            width={96}
            height={96}
            alt='Market listing picture'
            className='size-full rounded-md object-cover'
          />
        ) : (
          <div className='flex size-full items-center justify-center rounded-md'>
            <span className='text-foreground/30'>Image</span>
          </div>
        )}
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between'>
          <h3 className='font-medium'>{listing.title}</h3>
          <p className='font-mono text-lg font-bold'>
            {formatCurrency(listing.priceInCents)}
          </p>
        </div>

        <div className='mt-3 flex flex-row flex-nowrap items-end gap-4'>
          <div>
            <p className='mt-1  line-clamp-2 text-sm text-foreground/70'>
              {listing.description
                .split('\n')
                .slice(0, 3)
                .map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
            </p>

            <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1'>
              <span className='text-sm text-foreground/70'>
                Seller:{' '}
                {listing.author?.username ?? listing.author.id.toString()}
              </span>

              <span className='flex items-center text-sm text-foreground/70'>
                ★ {0} ({0} reviews)
              </span>

              <span
                className='text-sm text-foreground/70'
                title={countries.join(', ')}
              >
                Location: {formatTruncatedList(countries, 3)}
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
                className='button flex h-auto items-center justify-center gap-1 px-3 py-1.5'
                onClick={(e) => {
                  e.stopPropagation() // Prevent triggering parent onClick
                  onChat?.()
                }}
              >
                <FiMessageCircle size={14} />
                <span>Chat</span>
              </button>

              <button
                className='button-primary flex h-auto items-center justify-center gap-1 px-3 py-1.5'
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
                className='button flex h-auto items-center justify-center gap-1 !border-red-500 px-3 py-1.5 text-red-500'
                onClick={(e) => {
                  e.stopPropagation() // Prevent triggering parent onClick
                  onDelete?.()
                }}
              >
                <FiTrash2 size={14} />
                <span>Delete</span>
              </button>

              <button
                className='button-primary flex h-auto items-center justify-center gap-1 px-3 py-1.5'
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
