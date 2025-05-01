import { useQuery } from '@tanstack/react-query'
import { useCallback, useState, useEffect, useMemo } from 'react'
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiChevronDown,
  FiHeart,
  FiMessageCircle,
  FiX,
  FiPaperclip,
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
import ChatMarketListingMessage from '@/components/chat/ChatMarketListingMessage'
import { PageWithLayout } from '@/data/types/layout'
import type { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { QueryKeys } from '@/data/types/queries'
import { countries } from '@/utils/countries'
import { useApi } from '@/utils/frontend/api'
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

  // Chat bubble state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedListing, setSelectedListing] =
    useState<MarketListingSearchResult | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<
    Array<{
      type: 'text' | 'attachment' | 'listing'
      content: string
      sender: 'user' | 'other'
      listing?: MarketListingSearchResult
    }>
  >([])

  // Open chat with a specific listing
  const openChat = (item: MarketListingSearchResult) => {
    setSelectedListing(item)
    setIsChatOpen(true)

    // Demo: Add the listing as a message in the chat
    setChatMessages([
      ...chatMessages,
      {
        type: 'listing',
        content: `I'm interested in ${item.title}`,
        sender: 'user',
        listing: item,
      },
    ])
  }

  // Send a message in the chat
  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          type: 'text',
          content: chatMessage,
          sender: 'user',
        },
      ])
      setChatMessage('')

      // Demo: Mock response from the seller
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            type: 'text',
            content: `Thanks for your interest in my item! Would you like more information?`,
            sender: 'other',
          },
        ])
      }, 1000)
    }
  }

  // Simulate sending an attachment
  const sendAttachment = () => {
    setChatMessages([
      ...chatMessages,
      {
        type: 'attachment',
        content: 'image_attachment.jpg',
        sender: 'user',
      },
    ])
  }

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
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // Handle search button click
  const handleSearch = () => {
    // Reset to first page when performing a new search
    setCurrentPage(1)
    // Additional search logic could be added here if needed
    // For example, API calls or analytics tracking
  }

  return (
    <div className='h-full flex flex-col pb-16'>
      <div className='mb-6 flex flex-col md:flex-row md:justify-between md:items-center'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Marketplace</h1>
          <p className='text-foreground/70'>
            Browse, buy, and trade with trusted sellers on The Jade Trail
          </p>
        </div>
        <Link
          className='button-primary h-auto py-2 px-5 mt-3 md:mt-0'
          href='/dashboard/marketplace/create'
        >
          <FiPlus />
          <span>Create New Listing</span>
        </Link>
      </div>

      {/* Search and filter bar */}
      <div className='mb-6'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-row flex-nowrap items-stretch flex-grow'>
            <input
              type='text'
              placeholder='Search for items...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className='flex-1 bg-background-light px-4 py-2 border-y border-l border-foreground-light/75 rounded-l-md text-foreground'
            />
            <button
              onClick={handleSearch}
              className='px-4 border border-foreground-light/75 rounded-r-md bg-background text-foreground flex items-center justify-center hover:bg-background-dark transition-colors'
              aria-label='Search'
            >
              <FiSearch />
            </button>
          </div>

          <div className='flex flex-wrap gap-2 justify-between'>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1 p-2 rounded-md ${
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
                  className='px-4 py-2 border border-foreground-light/50 rounded-md appearance-none pr-8 bg-background'
                >
                  <option value='newest'>Newest</option>
                  <option value='price_low'>Price: Low to High</option>
                  <option value='price_high'>Price: High to Low</option>
                  <option value='rating'>Highest Rated</option>
                </select>
                <FiChevronDown className='absolute right-3 top-3 pointer-events-none text-foreground/50' />
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
          <div className='mt-4 p-4 border border-foreground/10 rounded-md'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div>
                <h4 className='font-medium mb-2'>Categories</h4>
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
                <h4 className='font-medium mb-2'>Location</h4>
                <div className='relative'>
                  <div className='flex items-center'>
                    <FiMapPin className='absolute left-3 top-2.5 text-foreground/50' />
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className='w-full p-2 pl-10 border-2 border-foreground/10 rounded-md appearance-none bg-background pr-10'
                    >
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className='absolute right-3 top-3 pointer-events-none text-foreground/50' />
                  </div>
                </div>

                {/* Featured regions section for quick selection */}
                <div className='mt-4'>
                  <h5 className='text-sm text-foreground/70 mb-2'>
                    Featured Regions
                  </h5>
                  <div className='flex flex-wrap gap-2'>
                    {['HK', 'CN', 'TW', 'SG', 'US', 'GB'].map((code) => {
                      const country = countries.find((c) => c.id === code)
                      return country ? (
                        <button
                          key={code}
                          onClick={() => setSelectedCountry(code)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            selectedCountry === code
                              ? 'bg-foreground text-background'
                              : 'bg-background-light border-2 border-foreground/10'
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
                <h4 className='font-medium mb-2'>Price Range</h4>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    placeholder='Min'
                    value={Math.round(minPrice) / 100}
                    onChange={(e) =>
                      setMinPrice(100 * parseInt(e.target.value))
                    }
                    className='w-full p-2 border-2 border-foreground/10 rounded-md'
                  />
                  <span>to</span>
                  <input
                    type='number'
                    placeholder='Max'
                    value={Math.round(maxPrice) / 100}
                    onChange={(e) =>
                      setMaxPrice(100 * parseInt(e.target.value))
                    }
                    className='w-full p-2 border-2 border-foreground/10 rounded-md'
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
      <div className='flex flex-wrap gap-2 mb-6'>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-1 rounded-full text-sm ${
              selectedCategory === category.id
                ? 'bg-foreground text-background'
                : 'bg-background-light border border-foreground-light/50'
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
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {listings?.data.map((item) => (
            <Link
              key={item.id.toString()}
              href={`/dashboard/marketplace/${item.id}`}
            >
              <MarketListingGridItem
                listing={item}
                isFavorite={favorites.some(
                  (fav) => fav.id.toString() === item.id.toString(),
                )}
                isMine={item.author.id.toString() === api.user?.id}
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
                onChat={() => openChat(item)}
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
            </Link>
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
              onChat={() => openChat(item)}
              // onBuy={() => openBuyModal(item)}
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
        <div className='text-center py-12'>
          <p className='text-foreground/50 text-lg'>
            No items found matching your criteria
          </p>
          <button onClick={clearQueryAndFilters} className='button mt-4'>
            Clear filters
          </button>
        </div>
      )}

      <div className='mt-8 mx-auto'>
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

      {/* Floating Chat Bubble */}
      {isChatOpen && selectedListing && (
        // <HoveringChatBox key={selectedListing.id} onClose={() => setIsChatOpen(false)} />

        <div className='fixed bottom-4 right-4 w-80 md:w-96 h-96 bg-background border-2 border-black dark:border-[#343434] rounded-lg shadow-xl flex flex-col z-50'>
          {/* Chat Header */}
          <div className='flex justify-between items-center p-3 border-b border-l border-r border-foreground/10 bg-background-light rounded-t-lg'>
            {' '}
            {/* Added border-l, border-r, and rounded-t-lg */}
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground'>
                {(
                  selectedListing.author.username ??
                  selectedListing.author.id.toString()
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <p className='font-medium text-sm'>
                  {selectedListing.author.username ??
                    selectedListing.author.id.toString()}
                </p>
                <p className='text-xs text-foreground/70 truncate'>
                  {selectedListing.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className='text-foreground/70 hover:text-foreground'
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className='flex-1 overflow-y-auto p-3 space-y-3'>
            {chatMessages.map((msg, i) =>
              msg.type === 'listing' && msg.listing ? (
                <ChatMarketListingMessage
                  key={i}
                  message={{
                    type: 'market-listing',
                    content: msg.listing,
                    sentAt: new Date().toISOString(),
                    sender: '00000000',
                    id: '00000001',
                  }}
                />
              ) : (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-black text-white border-2 border-foreground/20'
                        : 'bg-white text-black border-2 border-foreground/20'
                    }`}
                  >
                    {msg.type === 'text' && (
                      <p className='text-sm'>{msg.content}</p>
                    )}

                    {msg.type === 'attachment' && (
                      <div className='flex items-center gap-2 bg-background-light rounded p-2'>
                        <FiPaperclip size={14} />
                        <span className='text-sm'>{msg.content}</span>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Chat Input */}
          <div className='p-3 border-t border-foreground/10 flex gap-2'>
            <button
              onClick={sendAttachment}
              className='p-2 text-foreground/70 hover:text-foreground'
            >
              <FiPaperclip size={20} />
            </button>
            <input
              type='text'
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder='Type a message...'
              className='flex-1 py-2 px-3 border-2 border-foreground/20 rounded-full bg-background'
            />
            <button
              onClick={sendChatMessage}
              className='h-8 w-8 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-50'
              disabled={!chatMessage.trim()}
            >
              <FiMessageCircle size={16} />
            </button>
          </div>
        </div>
      )}

      {children}
    </div>
  )
}

MarketplaceLayout.PageLayout = function MarketplaceMetaLayout({ children }) {
  const GrandfatherLayout =
    DashboardLayout.PageLayout ?? (({ children }) => children)
  return (
    <GrandfatherLayout>
      <DashboardLayout>{children}</DashboardLayout>
    </GrandfatherLayout>
  )
}

export default MarketplaceLayout
