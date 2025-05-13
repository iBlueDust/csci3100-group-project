import React from 'react'
import { FiImage, FiTrash2 } from 'react-icons/fi'
import Image from 'next/image'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import type { MarketListingSearchResult } from '@/data/api/mongo/queries/market'
import { formatCurrency } from '@/utils/format'

export interface MarketListingSendPreviewProps {
  listing: MarketListingSearchResult
  onCancel?: () => void
}

const MarketListingSendPreview: React.FC<MarketListingSendPreviewProps> = ({
  listing,
  onCancel,
}) => {
  return (
    <div className='group mb-2 flex w-full items-stretch gap-4 rounded-lg border-2 border-foreground/10 bg-background-dark/10'>
      {listing.pictures.length > 0 ? (
        <Image
          src={listing.pictures[0]}
          alt='Attachment preview: market listing picture'
          width={80}
          height={80}
          className='size-20 rounded-l-md bg-background-dark object-cover'
        />
      ) : (
        <div className='flex size-20 items-center justify-center rounded-l-md bg-background-dark'>
          <FiImage className='text-foreground-light/50' />
        </div>
      )}

      <div className='flex flex-1 flex-col flex-nowrap justify-between gap-2 py-2'>
        <div className='flex justify-between gap-2'>
          <div className='inline-block'>
            <p className='mb-1 line-clamp-1' title={listing.title}>
              {listing.title}
            </p>
            <p
              className='line-clamp-2 text-xs text-foreground/70'
              title={listing.description}
            >
              {listing.description}
            </p>
          </div>
          <p className='text-right md:font-bold'>
            {formatCurrency(listing.priceInCents)}
          </p>
        </div>

        <div className='group:md:block hidden space-x-4 text-xs text-foreground-light'>
          <span>
            by {listing.author.username ?? listing.author.id.toString()}
          </span>
          <span className='group:md:inline-block hidden text-xs'>
            ★ {0} ({0} reviews)
          </span>
          <span className='group:md:inline-block hidden'>{'Canada'}</span>
          <span>{dayjs(listing.listedAt).fromNow()}</span>
        </div>
      </div>

      <button
        onClick={onCancel}
        className='mr-2 self-center text-foreground/70 transition-colors hover:text-red-500'
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  )
}

export default MarketListingSendPreview
