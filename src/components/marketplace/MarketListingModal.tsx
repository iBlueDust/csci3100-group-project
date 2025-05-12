import React, { useState } from 'react'
import { FiEdit, FiHeart, FiMessageCircle, FiTrash2, FiX } from 'react-icons/fi'
import dayjs from 'dayjs'
import Link from 'next/link'

import type { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { formatCurrency } from '@/utils/format'
import Image from 'next/image'
import SubmitButton from '../form/SubmitButton'
import { getCountryNameById } from '@/utils/countries'
import { getCategoryNameById } from '@/utils/categories'

export interface MarketListingModalProps {
  listing: MarketListingSearchResult
  isMine?: boolean
  onBuy?: () => void
  onChat?: () => void
  onEditListing?: () => void
  onDeleteListing?: () => void
  onClose?: () => void
}

const MarketListingModal: React.FC<MarketListingModalProps> = ({
  listing,
  isMine = false,
  onChat,
  onDeleteListing,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  return (
    <div className='fixed inset-0 z-10 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm'>
      <div className='flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg border-2 border-foreground/10 bg-background shadow-xl'>
        {/* Modal Header */}
        <div className='flex shrink-0 items-center justify-between border-b border-foreground/10 p-4'>
          <h1 className='truncate text-xl font-bold'>Listing Details</h1>
          <button
            onClick={onClose}
            className='rounded-full p-1 hover:bg-background-dark'
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className='overflow-y-auto p-4'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {/* Image Gallery */}
            <div className='space-y-3 md:col-span-2'>
              {/* Main Image */}
              <div className='rounded-lg bg-foreground/5'>
                {listing.pictures.length > 0 ? (
                  <Image
                    className='aspect-[4/3] w-full rounded-md object-cover'
                    width={650}
                    height={480}
                    src={listing.pictures[selectedImageIndex]}
                    alt={`Listing Image #${selectedImageIndex + 1}`}
                  />
                ) : (
                  <div className='flex aspect-[4/3] w-full items-center justify-center rounded-md'>
                    <span className='text-2xl text-foreground/30'>
                      No pictures
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Row */}
              <div className='grid grid-cols-5 gap-2'>
                {listing.pictures.map((url, i) => (
                  <label
                    key={i}
                    className='cursor-pointer overflow-hidden rounded-md hover:border hover:border-foreground/30'
                    onClick={() => setSelectedImageIndex(i)}
                  >
                    <Image
                      className='aspect-[4/3] w-full object-cover'
                      width={108}
                      height={81}
                      src={url}
                      alt={`Listing Image #${i + 1}`}
                    />

                    <input
                      type='radio'
                      name='picture'
                      value={i + 1}
                      checked={i === selectedImageIndex}
                      onChange={(e) =>
                        e.target.checked && setSelectedImageIndex(i)
                      }
                      className='hidden'
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Item Details */}
            <div className='flex flex-col md:col-span-1'>
              {/* Price and Actions */}
              <div className='mb-2'>
                <h2 className='mb-2 text-xl'>{listing.title}</h2>

                <div className='mb-3 flex items-center justify-between'>
                  <p className='mr-4 font-mono text-2xl font-bold'>
                    {formatCurrency(listing.priceInCents)}
                  </p>

                  <div className='flex items-center gap-2'>
                    <button className='text-foreground/50 hover:text-red-500'>
                      <FiHeart size={20} />
                    </button>
                  </div>
                </div>

                <div className='mb-2 flex flex-row flex-nowrap gap-2'>
                  {/* <button
                    onClick={onBuy}
                    className='button-primary w-full py-2 flex items-center justify-center gap-2 text-sm'
                  >
                    <FiShoppingCart size={16} />
                    Buy Now
                  </button> */}

                  {!isMine ? (
                    <SubmitButton
                      look='primary'
                      className='w-full'
                      onClick={onChat}
                    >
                      <div className='flex flex-row items-center justify-center gap-2 text-sm'>
                        <FiMessageCircle size={16} />
                        <span>Message Seller</span>
                      </div>
                    </SubmitButton>
                  ) : (
                    <>
                      <button
                        className='button flex h-auto items-center justify-center gap-1 !border-red-500 px-3 py-1.5 text-red-500'
                        onClick={onDeleteListing}
                      >
                        <FiTrash2 size={14} />
                        <span>Delete</span>
                      </button>

                      <Link
                        className='button-shape flex-1 bg-amber-400 text-black hover:bg-amber-500'
                        href={`/dashboard/marketplace/${listing.id}/edit`}
                      >
                        <div className='flex flex-row items-center justify-center gap-2 text-sm'>
                          <FiEdit size={16} />
                          <span>Edit</span>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Item Details */}
              <div className='space-y-2 text-sm'>
                <div>
                  <p className='text-xs text-foreground/70'>Category</p>
                  <p className='font-medium capitalize'>
                    {listing.categories
                      .map((id) => getCategoryNameById(id))
                      .filter(Boolean)
                      .join(', ') || 'Others'}
                  </p>
                </div>

                <div>
                  <p className='text-xs text-foreground/70'>Location</p>
                  <p className='font-medium'>
                    {listing.countries.map(getCountryNameById).join(', ')}
                  </p>
                </div>

                <div>
                  <p className='text-xs text-foreground/70'>Listed</p>
                  <p className='font-medium'>
                    {dayjs(listing.listedAt).format('DD MMM YYYY HH:mm')}
                  </p>
                </div>
              </div>

              {/* Seller Info */}
              <div className='mt-4 rounded-lg border border-foreground-light/50 p-3'>
                <div className='mb-1 flex items-center gap-2'>
                  <div className='flex size-8 items-center justify-center rounded-full bg-foreground/10 text-sm'>
                    {(listing.author.username ?? listing.author.id.toString())
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className='text-sm font-medium'>
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

              {/* Description */}
              <div className='mb-4 mt-6'>
                <h3 className='mb-2 text-lg font-bold'>Description</h3>
                <p className='whitespace-pre-wrap text-sm text-foreground/90'>
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Old description location */}
        </div>
      </div>
    </div>
  )
}

export default MarketListingModal
