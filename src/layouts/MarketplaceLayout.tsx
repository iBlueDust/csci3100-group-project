import { useQuery } from '@tanstack/react-query'
import { useCallback, useState, useEffect, useMemo } from 'react'
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiChevronDown,
  FiHeart,
  FiMapPin,
  FiPlus,
} from 'react-icons/fi'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import classNames from 'classnames'
import Link from 'next/link'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import DashboardLayout from '@/layouts/DashboardLayout'
import PaginationControls from '@/components/PaginationControls'
import MarketListingGridItem from '@/components/marketplace/MarketListingGridItem'
import { PageWithLayout } from '@/data/types/layout'
import type { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { QueryKeys } from '@/data/types/queries'
import { countries } from '@/utils/countries'
import { queryClient, useApi } from '@/utils/frontend/api'
import {
  HoveringChatBoxProvider,
  useHoveringChatBox,
} from '@/hooks/useHoveringChatBox'
const MarketListingListItem = dynamic(
  () => import('@/components/marketplace/MarketListingListItem'),
)

// Mock categories
const categories = [
  { id: 'all', name: 'All Items' },
  {
    id: 'favorite',
    name: (
      <div className='flex flex-row items-center gap-2'>
        <FiHeart /> <span>Favorites</span>
      </div>
    ),
  },
  { id: 'jade', name: 'Jade Items' },
  { id: 'antiques', name: 'Antiques' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'art', name: 'Artwork' },
  { id: 'gems', name: 'Precious Gems' },
]
// Countries are now imported from @/utils/countries

// Add interface for the Marketplace component props
export interface MarketplaceLayoutProps {
  children?: React.ReactNode
}

const MarketplaceLayout: PageWithLayout<MarketplaceLayoutProps> = ({
  children,
}) => {
  const api = useApi()
  const router = useRouter()

  const hoveringChatBox = useHoveringChatBox({ api })

  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(Number.POSITIVE_INFINITY)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [totalPages, setTotalPages] = useState(1)

  // Pagination parameters for API queries
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage

  const { data: listings, refetch } = useQuery({
    queryKey: [QueryKeys.MARKET_LISTINGS],
    queryFn: async () => {
      const options = {
        query: searchQuery,
        minPrice,
        maxPrice,
        skip: indexOfFirstItem,
        limit: itemsPerPage,
      }
      return await queryMarketListings(api, options)
    },
    enabled: !!api.user,
    refetchOnWindowFocus: false,
  })
  const indexOfLastItem = useMemo(
    () =>
      listings
        ? Math.min(indexOfFirstItem + itemsPerPage, listings.meta.total - 1)
        : indexOfFirstItem + itemsPerPage,
    [indexOfFirstItem, itemsPerPage, listings],
  )

  useEffect(() => {
    refetch()
  }, [itemsPerPage, currentPage, refetch])

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Favorites state
  const [favorites, setFavorites] = useState<MarketListingSearchResult[]>([])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategory('all')
    setMinPrice(0)
  }, [])

  const clearQueryAndFilters = useCallback(() => {
    clearFilters()
    setMaxPrice(Number.POSITIVE_INFINITY)
  }, [clearFilters])

  // Pagination calculations

  // Update total pages when filtered listings change
  useEffect(() => {
    if (!listings) return
    const numListings = listings.meta.total
    const numPages = Math.ceil(numListings / itemsPerPage)
    setTotalPages(Math.max(1, numPages))
    if (currentPage > numPages && numListings != null) {
      setCurrentPage(1)
    }
  }, [listings, itemsPerPage, currentPage])

  // Local storage for favorites persistence
  useEffect(() => {
    // Load favorites from localStorage on component mount
    const storedFavorites = localStorage.getItem('marketplace-favorites')
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch (e) {
        console.error('Failed to parse favorites from localStorage', e)
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('marketplace-favorites', JSON.stringify(favorites))
  }, [favorites])

  // Change page
  const paginate = useCallback(
    (pageNumber: number) => {
      if (pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber)
      }
    },
    [totalPages],
  )

  // Handle search button click
  const handleSearch = () => {
    // Reset to first page when performing a new search
    setCurrentPage(1)
    // Additional search logic could be added here if needed
    // For example, API calls or analytics tracking
  }

  return (
    <div className='flex h-full flex-col pb-16'>
      <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='mb-2 text-3xl font-bold'>Marketplace</h1>
          <p className='text-foreground/70'>
            Browse, buy, and trade with trusted sellers on The Jade Trail
          </p>
        </div>
        <Link
          className='button-primary mt-3 h-auto px-5 py-2 md:mt-0'
          href='/dashboard/marketplace/create'
        >
          <FiPlus />
          <span>Create New Listing</span>
        </Link>
      </div>

      {/* Search and filter bar */}
      <div className='mb-6'>
        <div className='flex flex-col gap-4'>
          <div className='flex grow flex-row flex-nowrap items-stretch'>
            <input
              type='text'
              placeholder='Search for items...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className='flex-1 rounded-l-md border-y border-l border-foreground-light/75 bg-background-light px-4 py-2 text-foreground'
            />
            <button
              onClick={handleSearch}
              className='flex items-center justify-center rounded-r-md border border-foreground-light/75 bg-background px-4 text-foreground transition-colors hover:bg-background-dark'
              aria-label='Search'
            >
              <FiSearch />
            </button>
          </div>

          <div className='flex flex-wrap justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1 rounded-md p-2 ${
                  showFilters ? 'bg-foreground/10' : ''
                }`}
              >
                <FiFilter />
                <span>Filters</span>
              </button>
            </div>

            <div className='flex items-center gap-2'>
              <div className='relative'>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className='appearance-none rounded-md border border-foreground-light/50 bg-background px-4 py-2 pr-8'
                >
                  <option value='newest'>Newest</option>
                  <option value='price_low'>Price: Low to High</option>
                  <option value='price_high'>Price: High to Low</option>
                  <option value='rating'>Highest Rated</option>
                </select>
                <FiChevronDown className='pointer-events-none absolute right-3 top-3 text-foreground/50' />
              </div>

              <div className='hidden md:flex'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={classNames(
                    'p-2 rounded-md border',
                    viewMode === 'grid'
                      ? 'bg-foreground/10 border-foreground-light/75'
                      : 'border-foreground-light/25',
                  )}
                >
                  <FiGrid />
                </button>

                <button
                  onClick={() => setViewMode('list')}
                  className={classNames(
                    'p-2 rounded-md border',
                    viewMode === 'list'
                      ? 'bg-foreground/10 border-foreground-light/75'
                      : 'border-foreground-light/25',
                  )}
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className='mt-4 rounded-md border border-foreground/10 p-4'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <div>
                <h4 className='mb-2 font-medium'>Categories</h4>
                <div className='space-y-2'>
                  {categories.map((category) => (
                    <div key={category.id} className='flex items-center'>
                      <input
                        type='radio'
                        id={category.id}
                        name='category'
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                        className='mr-2'
                      />
                      <label htmlFor={category.id}>{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className='mb-2 font-medium'>Location</h4>
                <div className='relative'>
                  <div className='flex items-center'>
                    <FiMapPin className='absolute left-3 top-2.5 text-foreground/50' />
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className='w-full appearance-none rounded-md border-2 border-foreground/10 bg-background p-2 px-10'
                    >
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className='pointer-events-none absolute right-3 top-3 text-foreground/50' />
                  </div>
                </div>

                {/* Featured regions section for quick selection */}
                <div className='mt-4'>
                  <h5 className='mb-2 text-sm text-foreground/70'>
                    Featured Regions
                  </h5>
                  <div className='flex flex-wrap gap-2'>
                    {['HK', 'CN', 'TW', 'SG', 'US', 'GB'].map((code) => {
                      const country = countries.find((c) => c.id === code)
                      return country ? (
                        <button
                          key={code}
                          onClick={() => setSelectedCountry(code)}
                          className={`rounded-full px-2 py-1 text-xs ${
                            selectedCountry === code
                              ? 'bg-foreground text-background'
                              : 'border-2 border-foreground/10 bg-background-light'
                          }`}
                        >
                          {country.name}
                        </button>
                      ) : null
                    })}
                  </div>
                </div>
              </div>

              <div>
                <h4 className='mb-2 font-medium'>Price Range</h4>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    placeholder='Min'
                    value={Math.round(minPrice) / 100}
                    onChange={(e) =>
                      setMinPrice(100 * parseInt(e.target.value))
                    }
                    className='w-full rounded-md border-2 border-foreground/10 p-2'
                  />
                  <span>to</span>
                  <input
                    type='number'
                    placeholder='Max'
                    value={Math.round(maxPrice) / 100}
                    onChange={(e) =>
                      setMaxPrice(100 * parseInt(e.target.value))
                    }
                    className='w-full rounded-md border-2 border-foreground/10 p-2'
                  />
                </div>
              </div>

              <div className='flex items-end'>
                <button onClick={clearFilters} className='button w-full'>
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category pills */}
      <div className='mb-6 flex flex-wrap gap-2'>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`rounded-full px-4 py-1 text-sm ${
              selectedCategory === category.id
                ? 'bg-foreground text-background'
                : 'border border-foreground-light/50 bg-background-light'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className='mb-4 text-foreground/70'>
        Showing {listings?.data.length}{' '}
        {listings?.data.length === 1 ? 'result' : 'results'}
      </p>

      {/* Item grid/list */}
      {viewMode === 'grid' ? (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {listings?.data.map((item) => (
            /* Cannot use Link because buttons are nested inside */
            <MarketListingGridItem
              key={item.id.toString()}
              listing={item}
              isFavorite={favorites.some(
                (fav) => fav.id.toString() === item.id.toString(),
              )}
              isMine={item.author.id.toString() === api.user?.id}
              onClick={() => router.push(`/dashboard/marketplace/${item.id}`)}
              onFavorite={() => {
                setFavorites((favorites) => [...favorites, item])
              }}
              onUnfavorite={() => {
                setFavorites(
                  favorites.filter(
                    (fav) => fav.id.toString() !== item.id.toString(),
                  ),
                )
              }}
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
      ) : (
        <div className='space-y-4'>
          {listings?.data.map((item) => (
            <MarketListingListItem
              key={item.id.toString()}
              listing={item}
              isFavorite={favorites.some(
                (fav) => fav.id.toString() === item.id.toString(),
              )}
              isMine={item.author.id.toString() === api.user?.id}
              onClick={() => router.push(`/dashboard/marketplace/${item.id}`)}
              onFavorite={() => {
                setFavorites((favorites) => [...favorites, item])
              }}
              onUnfavorite={() => {
                setFavorites(
                  favorites.filter(
                    (fav) => fav.id.toString() !== item.id.toString(),
                  ),
                )
              }}
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

      {/* Empty state */}
      {(!listings || listings.meta.total === 0) && (
        <div className='py-12 text-center'>
          <p className='text-lg text-foreground/50'>
            No items found matching your criteria
          </p>
          <button onClick={clearQueryAndFilters} className='button mt-4'>
            Clear filters
          </button>
        </div>
      )}

      <div className='mx-auto mt-8'>
        <PaginationControls
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          numberOfItems={listings?.meta.total}
          pageSize={itemsPerPage}
          onPageClick={paginate}
          onPrevClick={() => paginate(currentPage - 1)}
          onNextClick={() => paginate(currentPage + 1)}
          onPageSizeChange={(size) => {
            setCurrentPage(1)
            setItemsPerPage(size)
          }}
        />
      </div>

      {children}
    </div>
  )
}

MarketplaceLayout.getLayout = (page) => {
  const GrandfatherLayout = DashboardLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(
    <DashboardLayout>
      <HoveringChatBoxProvider>{page}</HoveringChatBoxProvider>
    </DashboardLayout>,
  )
}

export default MarketplaceLayout
