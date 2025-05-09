import React, { useCallback, useState } from 'react'
import {
  FiEdit,
  FiTrash2,
  FiShoppingCart,
  FiList,
  FiGrid,
  FiChevronDown,
  FiAlertCircle,
  FiPlus,
} from 'react-icons/fi'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import type { PageWithLayout } from '@/data/types/layout'
import { QueryKeys } from '@/data/types/queries'
import { useApi } from '@/utils/frontend/api'
import { formatCurrency } from '@/utils/format'
import CreateListingForm from '../../components/marketplace/CreateListingForm'
import DashboardLayout from '@/layouts/DashboardLayout'

export type MyListingsProps = object

const MyListings: PageWithLayout<MyListingsProps> = () => {
  const api = useApi()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState('newest')
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false)
  const [editingListing, setEditingListing] =
    useState<MarketListingSearchResult | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [listingToDelete, setListingToDelete] =
    useState<MarketListingSearchResult | null>(null)

  const { data: listings } = useQuery({
    queryKey: [QueryKeys.MARKET_LISTINGS],
    queryFn: async () => {
      const options = {}
      return await queryMarketListings(api, options)
    },
    enabled: !!api.user,
    refetchOnWindowFocus: false,
  })

  const viewListingInMarketplace = useCallback((_: string) => {}, [])

  const confirmDelete = useCallback(async () => {
    if (!listingToDelete) return;
    setIsDeleting(true);
    deleteMarketListingMutation.mutate(listingToDelete.id.toString(), {
      onSuccess: () => {
        alert('Listing deleted successfully!');
        setIsDeleteModalOpen(false);
        setListingToDelete(null);
      },
      onError: (error: any) => {

        alert(`Error: ${error.message || 'Failed to delete listing. Please try again.'}`);
      },
      onSettled: () => {
        setIsDeleting(false);
      },
    });
  }, [listingToDelete, deleteMarketListingMutation]);

  return (
    <div className='h-full flex flex-col pb-16'>
      <div className='mb-6 flex flex-col md:flex-row md:justify-between md:items-center'>
        <div>
          <h2 className='text-3xl font-bold mb-2'>My Listings</h2>
          <p className='text-foreground/70'>
            Manage your items for sale on The Jade Trail
          </p>
        </div>
        <button
          className='button-primary h-auto py-2 px-5 mt-3 md:mt-0'
          onClick={() => setIsCreateListingOpen(true)}
        >
          <div className='flex items-center gap-2'>
            <FiPlus />
            <span>Create New Listing</span>
          </div>
        </button>
      </div>

      <div className='mb-6'>
        <div className='flex flex-col gap-3'>
          <div className='text-foreground/70 text-center md:text-left'>
            Showing {listings?.data.length}{' '}
            {listings?.data.length === 1 ? 'listing' : 'listings'}
          </div>
          <div className='flex justify-center md:justify-end gap-2'>
            <div className='relative'>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className='h-full px-4 py-2 border-2 border-foreground/10 rounded-md appearance-none pr-8 bg-background'
              >
                <option value='newest'>Newest First</option>
                <option value='oldest'>Oldest First</option>
                <option value='price_low'>Price: Low to High</option>
                <option value='price_high'>Price: High to Low</option>
                <option value='rating'>Highest Rated</option>
              </select>
              <FiChevronDown className='absolute right-3 top-3 pointer-events-none text-foreground/50' />
            </div>

            <div className='hidden md:flex'>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid' ? 'bg-foreground/10' : ''
                }`}
              >
                <FiGrid />
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' ? 'bg-foreground/10' : ''
                }`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>
      </div>

      {listings?.data.length === 0 && (
        <div className='flex-1 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-foreground/10 rounded-lg'>
          <FiShoppingCart size={48} className='mb-4 text-foreground/30' />
          <h3 className='text-xl font-bold mb-2'>No Listings Yet</h3>
          <p className='text-foreground/70 mb-6 max-w-md'>
            You haven&apos;t created any listings yet. Create your first listing
            to start selling on The Jade Trail!
          </p>
          <button
            onClick={() => setIsCreateListingOpen(true)}
            className='button-primary'
          >
            <div className='flex items-center gap-2'>
              <FiPlus />
              <span>Create Your First Listing</span>
            </div>
          </button>
        </div>
      )}

      {listings && listings.data.length > 0 && viewMode === 'grid' && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {listings.data.map((listing) => (
            <div
              key={listing.id.toString()}
              className='bg-background-light border-2 border-foreground/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-[595px] flex flex-col'
              onClick={() => viewListingInMarketplace(listing.id.toString())}
            >
              <div className='h-48 bg-foreground/5 overflow-hidden flex-shrink-0'>
                {listing.pictures.length > 0 ? (
                  <Image
                    width={100}
                    height={100}
                    src={listing.pictures[0]}
                    alt='Item Image'
                    className='w-full h-full object-cover'
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
                </div>

                <p className='text-lg font-mono font-bold mt-1'>
                  {formatCurrency(listing.priceInCents)}
                </p>

                <div className='flex items-center text-sm mt-1 text-foreground/70'>
                  <span className='flex items-center'>★ {0}</span>
                  <span className='mx-1'>•</span>
                  <span>{0} reviews</span>
                </div>

                <p
                  className='text-sm mt-1 text-foreground/70 line-clamp-1'
                  title='Seller: You'
                >
                  Seller: You
                </p>

                <p
                  className='text-sm mt-2 text-foreground/70 line-clamp-2 flex-grow'
                  title={listing.description}
                >
                  {listing.description}
                </p>

                <div className='flex flex-col mt-auto pt-4 pb-4'>
                  <span className='text-xs text-foreground/50 mb-3'>
                    Listed: {dayjs(listing.listedAt).fromNow()}
                  </span>
                  <div className='flex justify-between'>
                    <button
                      className='button py-1.5 px-3 h-auto flex items-center gap-1 flex-1 mr-1 justify-center text-red-500'
                      onClick={(e) => {
                        e.stopPropagation()
                        setListingToDelete(listing)
                        setIsDeleteModalOpen(true)
                      }}
                    >
                      <FiTrash2 size={14} />
                      <span>Delete</span>
                    </button>
                    <button
                      className='button-primary py-1.5 px-3 h-auto flex items-center gap-1 flex-1 ml-1 justify-center'
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingListing(listing)
                      }}
                    >
                      <FiEdit size={14} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {listings && listings.data.length > 0 && viewMode === 'list' && (
        <div className='space-y-4'>
          {listings.data.map((listing) => (
            <div
              key={listing.id.toString()}
              className='bg-background-light border-2 border-foreground/10 rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer'
              onClick={() => viewListingInMarketplace(listing.id.toString())}
            >
              <div className='h-24 w-24 bg-foreground/5 shrink-0 overflow-hidden'>
                {listing.pictures.length > 0 ? (
                  <Image
                    width={100}
                    height={100}
                    src={listing.pictures[0]}
                    alt='Item Image'
                    className='w-full h-full object-cover'
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

                <p className='text-sm mt-1 line-clamp-2 text-foreground/70'>
                  {listing.description}
                </p>

                <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-2'>
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

                <div className='flex mt-3 gap-2'>
                  <button
                    className='button py-1 px-3 h-auto flex items-center gap-1 text-red-500'
                    onClick={(e) => {
                      e.stopPropagation()
                      setListingToDelete(listing)
                      setIsDeleteModalOpen(true)
                    }}
                  >
                    <FiTrash2 size={14} />
                    <span>Delete</span>
                  </button>
                  <button
                    className='button-primary py-1 px-3 h-auto flex items-center gap-1'
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingListing(listing)
                    }}
                  >
                    <FiEdit size={14} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isCreateListingOpen || editingListing) && (
        <CreateListingForm
          onClose={() => {
            setIsCreateListingOpen(false)
            setEditingListing(null)
          }}
          onSuccess={(listingId) => {
            setIsCreateListingOpen(false)
            setEditingListing(null)

            alert(
              `Listing ${
                editingListing ? 'updated' : 'created'
              } successfully! ID: ${listingId}`,
            )
          }}
          initialData={
            editingListing
              ? {
                  title: editingListing.title,
                  description: editingListing.description,
                  priceInCents: editingListing.priceInCents,
                  category: 'jade',
                  countries: editingListing.countries,
                }
              : undefined
          }
          listingId={editingListing ? editingListing.id.toString() : undefined}
          isEditing={!!editingListing}
        />
      )}

      {isDeleteModalOpen && listingToDelete && (
        <div className='fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-background rounded-lg p-6 max-w-md w-full shadow-xl border-2 border-foreground/10'>
            <div className='flex items-center gap-3 mb-4 text-red-500'>
              <FiAlertCircle size={24} />
              <h2 className='text-xl font-bold'>Delete Listing</h2>
            </div>

            <p className='mb-4'>
              Are you sure you want to delete &quot;
              <span className='font-medium'>{listingToDelete.title}</span>
              &quot;? This action cannot be undone.
            </p>

            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className='button px-4'
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className='button bg-red-500 text-white px-4 hover:bg-red-600'
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

MyListings.PageLayout = function MyListingsLayout({ children }) {
  const GrandfatherLayout =
    DashboardLayout.PageLayout ?? (({ children }) => children)
  return (
    <GrandfatherLayout>
      <DashboardLayout>{children}</DashboardLayout>
    </GrandfatherLayout>
  )
}

export default MyListings
