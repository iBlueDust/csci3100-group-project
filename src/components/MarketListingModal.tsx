import React from 'react'
import { FiHeart, FiMessageCircle, FiShoppingCart, FiX } from 'react-icons/fi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import type { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { formatCurrency } from '@/utils/format'

export interface MarketListingModalProps {
  listing: MarketListingSearchResult
  isMine?: boolean
  onBuy?: () => void
  onChat?: () => void
  onEditListing?: () => void
  onClose?: () => void
}

const MarketListingModal: React.FC<MarketListingModalProps> = ({
  listing,
  isMine = false,
  onBuy,
  onChat,
  onEditListing,
  onClose,
}) => {
  return (
    <div className='fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-background rounded-lg max-w-3xl w-full shadow-xl border-2 border-foreground/10 max-h-[90vh] flex flex-col'>
        {/* Modal Header */}
        <div className='flex justify-between items-center p-4 border-b border-foreground/10 shrink-0'>
          <h2 className='text-xl font-bold truncate'>{listing.title}</h2>
          <button
            onClick={onClose}
            className='p-1 hover:bg-background-dark rounded-full'
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className='p-4 overflow-y-auto'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Image Gallery */}
            <div className='md:col-span-2 space-y-3'>
              {/* Main Image */}
              <div className='bg-foreground/5 rounded-lg h-64 flex items-center justify-center'>
                <span className='text-foreground/30 text-lg'>Item Images</span>
              </div>

              {/* Thumbnail Row */}
              <div className='grid grid-cols-5 gap-2'>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className='bg-foreground/5 rounded-md h-12 flex items-center justify-center cursor-pointer hover:border-2 hover:border-foreground/30'
                  >
                    <span className='text-foreground/30 text-xs'>{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Item Details */}
            <div className='md:col-span-1 flex flex-col'>
              {/* Price and Actions */}
              <div className='mb-2'>
                <div className='flex justify-between items-center mb-3'>
                  <p className='text-2xl font-mono font-bold mr-4'>
                    {formatCurrency(listing.priceInCents)}
                  </p>
                  <div className='flex items-center gap-2'>
                    <button className='text-foreground/50 hover:text-red-500'>
                      <FiHeart size={20} />
                    </button>
                    {/* Mock check to simulate if user is the owner */}
                    {isMine && (
                      <button
                        onClick={onEditListing}
                        className='text-foreground/50 hover:text-blue-500'
                      >
                        <span className='text-sm'>Edit</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <button
                    onClick={onBuy}
                    className='button-primary w-full py-2 flex items-center justify-center gap-2 text-sm'
                  >
                    <FiShoppingCart size={16} />
                    Buy Now
                  </button>

                  <button
                    onClick={onChat}
                    className='button w-full py-2 flex items-center justify-center gap-2 text-sm'
                  >
                    <FiMessageCircle size={16} />
                    Message Seller
                  </button>
                </div>
              </div>

              {/* Seller Info */}
              <div className='mb-4 p-3 border-2 border-foreground/10 rounded-lg'>
                <div className='flex items-center gap-2 mb-1'>
                  <div className='w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-sm'>
                    {(listing.author.username ?? listing.author.id.toString())
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className='font-medium text-sm'>
                      {listing.author.username ?? listing.author.id.toString()}
                    </p>
                    <div className='flex items-center text-xs text-foreground/70'>
                      <span className='flex items-center'>★ {0}</span>
                      <span className='mx-1'>•</span>
                      <span>{0} reviews</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className='space-y-2 text-sm'>
                <div>
                  <p className='text-xs text-foreground/70'>Category</p>
                  <p className='font-medium capitalize'>{'--'}</p>
                </div>

                <div>
                  <p className='text-xs text-foreground/70'>Location</p>
                  <p className='font-medium'>{listing.countries.join(', ')}</p>
                </div>

                <div>
                  <p className='text-xs text-foreground/70'>Listed</p>
                  <p className='font-medium'>
                    {dayjs(listing.listedAt).fromNow()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className='mt-6 border-t border-foreground/10 pt-6'>
            <h3 className='text-lg font-bold mb-3'>Description</h3>
            <p className='whitespace-pre-line text-foreground/90 text-sm'>
              {listing.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketListingModal
