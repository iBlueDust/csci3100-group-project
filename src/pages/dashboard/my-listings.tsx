import React, { useCallback, useMemo, useState } from 'react'
import {
  FiShoppingCart,
  FiList,
  FiGrid,
  FiChevronDown,
  FiPlus,
} from 'react-icons/fi'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import type { PageWithLayout } from '@/data/types/layout'
import { QueryKeys } from '@/data/types/queries'
import { useApi } from '@/utils/frontend/api'
import DashboardLayout from '@/layouts/DashboardLayout'
import MarketListingGridItem from '@/components/marketplace/MarketListingGridItem'
import { useHoveringChatBox } from '@/hooks/useHoveringChatBox'

const MarketListingListItem = dynamic(
  () => import('@/components/marketplace/MarketListingListItem'),
)
const WarningConfirmModal = dynamic(
  () => import('@/components/WarningConfirmModal'),
)
const NewMarketListingModal = dynamic(
  () => import('@/components/marketplace/NewMarketListingModal'),
)
const EditMarketListingModal = dynamic(
  () => import('@/components/marketplace/EditMarketListingModal'),
)

export type MyListingsProps = object

const MyListings: PageWithLayout<MyListingsProps> = () => {
  const api = useApi()
  const router = useRouter()
  const queryClient = useQueryClient()

  const hoveringChatBox = useHoveringChatBox({ api })

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState('newest')
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false)
  const [editingListing, setEditingListing] =
    useState<MarketListingSearchResult | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [listingToDelete, setListingToDelete] =
    useState<MarketListingSearchResult | null>(null)

  // Filter listings to only show the user's own listings (mock implementation)
  // In a real app, you would fetch these from an API
  const { data: listings } = useQuery({
    queryKey: [QueryKeys.MARKET_LISTINGS, 'my-listings'],
    queryFn: async () => {
      const options = {
        author: api.user?.id,
      }
      return await queryMarketListings(api, options)
    },
    enabled: !!api.user,
    refetchOnWindowFocus: false,
  })

  // Function to handle viewing a listing in the marketplace
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const viewListingInMarketplace = useCallback((_: string) => {}, [])

  // Handle deletion of a listing
  const confirmDelete = useCallback(() => {
    // In a real app, you would call an API to delete the listing
    // For now, we'll just close the modal
    setIsDeleteModalOpen(false)
    setListingToDelete(null)
    // Show success message
    alert('Listing deleted successfully!')
  }, [])

  const modalInitialData = useMemo(
    () =>
      editingListing
        ? {
            title: editingListing.title,
            description: editingListing.description,
            pictures: editingListing.pictures,
            priceInCents: editingListing.priceInCents,
            category: 'jade',
            countries: editingListing.countries,
          }
        : { countries: ['hk'] },
    [editingListing],
  )

  const onListingSubmitted = useCallback(() => {
    setIsCreateListingOpen(false)
    setEditingListing(null)

    // In a real app, you might refresh the listings or navigate to the new listing
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.MARKET_LISTINGS, 'my-listings'],
    })
  }, [queryClient])

  const closeListingModal = useCallback(() => {
    setIsCreateListingOpen(false)
    setEditingListing(null)
  }, [])

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

      {/* Filters and sorting */}
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

      {/* Empty state */}
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

      {/* Grid View */}
      {listings && listings.data.length > 0 && viewMode === 'grid' && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {listings.data.map((item) => (
            <MarketListingGridItem
              key={item.id.toString()}
              listing={item}
              isMine={item.author.id.toString() === api.user?.id}
              onClick={() => router.push(`/dashboard/marketplace/${item.id}`)}
              onChat={() => hoveringChatBox.show(item)}
              onEdit={() => {
                queryClient.setQueryData(
                  [QueryKeys.MARKET_LISTINGS, item.id],
                  () => item,
                )
                router.push(`/dashboard/marketplace/${item.id}/edit`)
              }}
              onDelete={() => {
                if (
                  !confirm(`Are you sure you want to delete "${item.title}"?`)
                ) {
                  return
                }
                // TODO: Delete listing API call
              }}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {listings && listings.data.length > 0 && viewMode === 'list' && (
        <div className='space-y-4'>
          {listings.data.map((item) => (
            <MarketListingListItem
              key={item.id.toString()}
              listing={item}
              isMine={item.author.id.toString() === api.user?.id}
              onClick={() => router.push(`/dashboard/marketplace/${item.id}`)}
              onChat={() => hoveringChatBox.show(item)}
              onEdit={() =>
                router.push(`/dashboard/marketplace/${item.id}/edit`)
              }
              onDelete={() => {
                if (
                  !confirm(`Are you sure you want to delete "${item.title}"?`)
                ) {
                  return
                }

                // TODO: Delete listing API call
              }}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Listing Form Modal */}
      {isCreateListingOpen ? (
        <NewMarketListingModal
          initialData={modalInitialData}
          onClose={closeListingModal}
          onSuccess={onListingSubmitted}
        />
      ) : (
        editingListing && (
          <EditMarketListingModal
            initialData={modalInitialData}
            onClose={closeListingModal}
            onSuccess={onListingSubmitted}
            listingId={editingListing.id.toString()}
          />
        )
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && listingToDelete && (
        <WarningConfirmModal
          title='Delete Listing'
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        >
          Are you sure you want to delete &quot;
          <span className='font-medium'>{listingToDelete.title}</span>
          &quot;? This action cannot be undone.
        </WarningConfirmModal>
      )}
    </div>
  )
}

MyListings.getLayout = (page) => {
  const GrandfatherLayout = DashboardLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<DashboardLayout>{page}</DashboardLayout>)
}

export default MyListings
