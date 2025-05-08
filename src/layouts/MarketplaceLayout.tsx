import { useQuery } from '@tanstack/react-query'
import { useCallback, useState, useEffect, useMemo } from 'react'
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiChevronDown,
  FiMapPin,
  FiPlus,
  FiUser,
} from 'react-icons/fi'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import classNames from 'classnames'
import Link from 'next/link'
import debounce from 'lodash/debounce'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { PageWithLayout } from '@/data/types/layout'
import type { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { QueryKeys } from '@/data/types/queries'
import { countries, getFeaturedCountries } from '@/utils/countries'
import { queryClient, useApi } from '@/utils/frontend/api'
import {
  HoveringChatBoxProvider,
  useHoveringChatBox,
} from '@/hooks/useHoveringChatBox'
import { categories } from '@/utils/categories'

import DashboardLayout from '@/layouts/DashboardLayout'
import PaginationControls from '@/components/PaginationControls'
import MarketListingGridItem from '@/components/marketplace/MarketListingGridItem'
import Input from '@/components/form/Input'
import Select from '@/components/form/Select'
const MarketListingListItem = dynamic(
  () => import('@/components/marketplace/MarketListingListItem'),
)

const specialCategories = [
  { id: 'all', name: 'All Items' },
  {
    id: 'my-listings',
    name: (
      <div className='flex flex-row items-center gap-2'>
        <FiUser /> <span>My Listings</span>
      </div>
    ),
  },
]
const displayedCategories = [...specialCategories, ...categories]

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
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(Number.POSITIVE_INFINITY)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(1)

  // Pagination parameters for API queries
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (priceMin > 0 || priceMax < Number.POSITIVE_INFINITY) count++
    if (selectedCategory !== 'all') count++
    if (selectedCountry !== 'all') count++
    return count
  }, [searchQuery, priceMin, priceMax, selectedCategory, selectedCountry])

  const {
    data: listings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QueryKeys.MARKET_LISTINGS],
    queryFn: async () => {
      const options = {
        query: searchQuery,
        priceMin,
        priceMax,
        author: selectedCategory === 'my-listings' ? api.user?.id : undefined,
        countries:
          typeof selectedCountry === 'string' && selectedCountry !== 'all'
            ? [selectedCountry]
            : undefined,
        // category: selectedCategory,
        // sort: sortOption,
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

  // Favorites state
  const [favorites, setFavorites] = useState<MarketListingSearchResult[]>([])

  const clearFilters = useCallback(() => {
    setSelectedCategory('all')
    setSelectedCountry('all')
    setPriceMin(0)
    setPriceMax(Number.POSITIVE_INFINITY)
  }, [])

  const clearQueryAndFilters = useCallback(() => {
    clearFilters()
    setSearchQuery('')
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
  const handleSearch = useCallback(() => {
    setCurrentPage(1)
    refetch()
  }, [refetch])

  const handleSearchDebounced = useMemo(
    () => debounce(handleSearch, 500),
    [handleSearch],
  )

  useEffect(() => {
    handleSearch()
  }, [
    handleSearch,
    itemsPerPage,
    currentPage,
    selectedCountry,
    selectedCategory,
    sortOption,
  ])

  useEffect(() => {
    handleSearchDebounced()
  }, [handleSearchDebounced, searchQuery, priceMin, priceMax])

  const handleTextInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch],
  )

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
              onKeyDown={handleTextInputKeyDown}
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

          <div className='flex flex-wrap items-center justify-between'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={classNames(
                'flex items-center gap-1 rounded-md px-3 py-2 transition-colors hover:bg-foreground/10',
                showFilters && 'bg-foreground/10',
              )}
              title={
                !activeFilterCount
                  ? 'Filters'
                  : `${activeFilterCount} active ${
                      activeFilterCount > 1 ? 'filters' : 'filter'
                    }`
              }
            >
              <FiFilter />

              <span>Filters</span>

              {activeFilterCount > 0 && (
                <div className='ml-2 size-5 rounded-xl bg-foreground text-center align-middle text-sm text-background'>
                  <span className='mx-auto inline-block'>
                    {activeFilterCount}
                  </span>
                </div>
              )}
            </button>

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
          <div className='mt-4 rounded-md border border-foreground-light/25 p-4'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <div>
                <h4 className='mb-2 font-medium'>Categories</h4>
                <div className='space-y-2'>
                  {displayedCategories.map((category) => (
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
                <h4 className='mb-3 font-medium'>Location</h4>
                <div className='relative'>
                  <div className='flex flex-row items-center'>
                    <FiMapPin className='absolute left-3 top-2.5 text-foreground-light' />
                    <Select
                      value={selectedCountry.toUpperCase()}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className='pl-8'
                      options={countries.map((country) => ({
                        id: country.id,
                        name: country.name,
                      }))}
                    />
                  </div>
                </div>

                {/* Featured regions section for quick selection */}
                <div className='mt-4'>
                  <h5 className='mb-2 text-sm text-foreground/70'>
                    Featured Regions
                  </h5>
                  <div className='flex flex-wrap gap-2'>
                    {getFeaturedCountries().map((code) => {
                      const country = countries.find((c) => c.id === code)
                      return country ? (
                        <button
                          key={code}
                          onClick={() => setSelectedCountry(code)}
                          className={classNames(
                            'rounded-full px-3 py-1 text-xs',
                            selectedCountry === code
                              ? 'bg-foreground text-background'
                              : 'border border-foreground-light/75 bg-background-light',
                          )}
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
                  <Input
                    type='number'
                    placeholder='Min'
                    value={Math.round(priceMin) / 100}
                    onChange={(e) =>
                      setPriceMin(100 * parseInt(e.target.value))
                    }
                    onKeyDown={handleTextInputKeyDown}
                    hideError
                  />
                  <span>to</span>
                  <Input
                    type='number'
                    placeholder='Max'
                    value={Math.round(priceMax) / 100}
                    onChange={(e) =>
                      setPriceMax(100 * parseInt(e.target.value))
                    }
                    onKeyDown={handleTextInputKeyDown}
                    hideError
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
        {displayedCategories.map((category) => (
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

      {/* Loading state */}
      {isLoading && !listings && (
        <div className='h-full py-12 text-center align-middle text-5xl font-bold text-foreground-light/50'>
          Loading...
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!listings || listings.meta.total === 0) && (
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
