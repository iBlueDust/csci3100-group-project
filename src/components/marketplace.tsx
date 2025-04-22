import { useQuery } from '@tanstack/react-query'
import { useCallback, useState, useEffect } from 'react'
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiChevronDown,
  FiHeart,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
  FiMessageCircle,
  FiX,
  FiPaperclip,
  FiCreditCard,
  FiCheckCircle,
  FiMapPin,
  FiPlus,
} from 'react-icons/fi'
import Image from 'next/image'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import Input from '@/components/Input'
import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { QueryKeys } from '@/data/types/queries'
import type { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { countries } from '@/utils/countries'
import { useApi } from '@/utils/frontend/api'
import { formatCurrency } from '@/utils/format'
import CreateListingForm from './CreateListingForm'

// Mock categories
const categories = [
  { id: 'all', name: 'All Items' },
  { id: 'jade', name: 'Jade Items' },
  { id: 'antiques', name: 'Antiques' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'art', name: 'Artwork' },
  { id: 'gems', name: 'Precious Gems' },
]
// Countries are now imported from @/utils/countries

// Add interface for the Marketplace component props
export type MarketplaceProps = object

const Marketplace: React.FC<MarketplaceProps> = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(Number.POSITIVE_INFINITY)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [totalPages, setTotalPages] = useState(1)

  // Pagination parameters for API queries
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage
  const indexOfLastItem = indexOfFirstItem + itemsPerPage + 1

  const api = useApi()

  const { data: listings } = useQuery({
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

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Favorites state
  const [favorites, setFavorites] = useState<MarketListingSearchResult[]>([])
  const [showFavorites, setShowFavorites] = useState(false)

  // Add state for detailed listing modal
  const [detailedListing, setDetailedListing] =
    useState<MarketListingSearchResult | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Function to open detailed listing modal
  const openDetailModal = (item: MarketListingSearchResult) => {
    setDetailedListing(item)
    setIsDetailModalOpen(true)
  }

  // Function to close detailed listing modal
  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
    setDetailedListing(null)
  }

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

  // Create listing form state
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false)
  const [editingListing, setEditingListing] =
    useState<MarketListingSearchResult | null>(null)

  // Buy modal state
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [buyingListing, setBuyingListing] =
    useState<MarketListingSearchResult | null>(null)
  const [purchaseStep, setPurchaseStep] = useState<
    'confirm' | 'payment' | 'complete'
  >('confirm')

  // Open buy modal with a specific listing
  const openBuyModal = (item: MarketListingSearchResult) => {
    setBuyingListing(item)
    setIsBuyModalOpen(true)
    setPurchaseStep('confirm')
  }

  // Handle the purchase flow
  const handlePurchase = () => {
    if (purchaseStep === 'confirm') {
      setPurchaseStep('payment')
    } else if (purchaseStep === 'payment') {
      // In a real app, you would process the payment here
      setPurchaseStep('complete')
      // Simulate completion after 2 seconds
      setTimeout(() => {
        setIsBuyModalOpen(false)
        setBuyingListing(null)
        setPurchaseStep('confirm')
        // Show success message or notification
        alert('Purchase completed successfully!')
      }, 2000)
    }
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

  // Event listeners for favorites functionality from the header button
  useEffect(() => {
    const handleToggleFavorites = () => {
      setShowFavorites((prev) => !prev)
    }

    const handleShowFavorites = () => {
      setShowFavorites(true)
    }

    window.addEventListener('toggle-favorites', handleToggleFavorites)
    window.addEventListener('show-favorites', handleShowFavorites)

    return () => {
      window.removeEventListener('toggle-favorites', handleToggleFavorites)
      window.removeEventListener('show-favorites', handleShowFavorites)
    }
  }, [])

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
        <button
          className='button-primary h-auto py-2 px-5 mt-3 md:mt-0'
          onClick={() => setIsCreateListingOpen(true)}
        >
          <FiPlus />
          <span>Create New Listing</span>
        </button>
      </div>

      {/* Search and filter bar */}
      <div className='mb-6'>
        <div className='flex flex-col gap-4'>
          <div className='relative flex-grow'>
            <Input
              type='text'
              placeholder='Search for items...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className='w-full px-4 py-2 pr-12 border-2 border-foreground/10 rounded-md text-black outline-none focus:outline-none focus:border-foreground/10'
            />
            <button
              onClick={handleSearch}
              className='absolute right-0 top-0 h-full px-4 rounded-r-md bg-foreground text-background flex items-center justify-center'
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
                  className='h-full px-4 py-2 border-2 border-foreground/10 rounded-md appearance-none pr-8 bg-background'
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
                : 'bg-background-light border border-foreground/10'
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
            <button
              key={item.id.toString()}
              className='bg-background-light border-2 border-foreground/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-[595px] flex flex-col'
              onClick={() => openDetailModal(item)}
            >
              {/* Item image - fixed height */}
              <div className='h-48 bg-foreground/5 overflow-hidden flex-shrink-0'>
                {item.pictures.length > 0 ? (
                  <Image
                    src={item.pictures[0]}
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
                    title={item.title}
                  >
                    {item.title}
                  </h3>
                  <button
                    className={`flex-shrink-0 ${
                      favorites.some(
                        (fav) => fav.id.toString() === item.id.toString(),
                      )
                        ? 'text-red-500'
                        : 'text-foreground/50 hover:text-red-500'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation() // Prevent triggering parent onClick
                      // Add to favorites logic
                      if (
                        favorites.some(
                          (fav) => fav.id.toString() === item.id.toString(),
                        )
                      ) {
                        setFavorites(
                          favorites.filter(
                            (fav) => fav.id.toString() !== item.id.toString(),
                          ),
                        )
                      } else {
                        setFavorites([...favorites, item])
                      }
                    }}
                  >
                    <FiHeart
                      className={
                        favorites.some(
                          (fav) => fav.id.toString() === item.id.toString(),
                        )
                          ? 'fill-current'
                          : ''
                      }
                    />
                  </button>
                </div>

                <p className='text-lg font-mono font-bold mt-1'>
                  {formatCurrency(item.priceInCents)}
                </p>

                <div className='flex items-center text-sm mt-1 text-foreground/70'>
                  <span className='flex items-center'>★ {0}</span>
                  <span className='mx-1'>•</span>
                  <span>{0} reviews</span>
                </div>

                <p className='text-sm mt-1 text-foreground/70 line-clamp-1'>
                  Seller: {item.author.username ?? item.author.id.toString()}
                </p>

                {/* Add description with line clamp */}
                <p className='text-sm mt-2 text-foreground/70 line-clamp-2 flex-grow'>
                  {item.description}
                </p>

                {/* Push buttons to the bottom with mt-auto */}
                <div className='flex flex-col mt-auto pt-4 pb-4'>
                  <span className='text-xs text-foreground/50 mb-3'>
                    Listed: {dayjs(item.listedAt).fromNow()}
                  </span>
                  <div className='flex justify-between'>
                    {/* Only show chat button for listings where user is not the seller */}
                    {item.author.id.toString() !== api.user?.username ? (
                      <button
                        className='button py-1.5 px-3 h-auto flex items-center gap-1 flex-1 mr-1 justify-center'
                        onClick={(e) => {
                          e.stopPropagation() // Prevent triggering parent onClick
                          openChat(item)
                        }}
                      >
                        <FiMessageCircle size={14} />
                        <span>Chat</span>
                      </button>
                    ) : (
                      <button
                        className='button py-1.5 px-3 h-auto flex items-center gap-1 flex-1 mr-1 justify-center text-red-500'
                        onClick={(e) => {
                          e.stopPropagation() // Prevent triggering parent onClick
                          if (
                            confirm(
                              `Are you sure you want to delete "${item.title}"?`,
                            )
                          ) {
                            // In a real app, this would call an API to delete the listing
                            alert(`Listing "${item.title}" has been deleted.`)
                            // You would typically refresh the listings after deletion
                          }
                        }}
                      >
                        <span>Delete</span>
                      </button>
                    )}
                    {/* Show different buttons based on whether user is the seller */}
                    {item.author.id.toString() === api.user?.id ? (
                      <button
                        className='button-primary py-1.5 px-3 h-auto flex items-center gap-1 flex-1 ml-1 justify-center'
                        onClick={(e) => {
                          e.stopPropagation() // Prevent triggering parent onClick
                          setEditingListing(item)
                        }}
                      >
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button
                        className='button-primary py-1.5 px-3 h-auto flex items-center gap-1 flex-1 ml-1 justify-center'
                        onClick={(e) => {
                          e.stopPropagation() // Prevent triggering parent onClick
                          openBuyModal(item)
                        }}
                      >
                        <FiShoppingCart size={14} />
                        <span>Buy</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className='space-y-4'>
          {listings?.data.map((item) => (
            <div
              key={item.id.toString()}
              className='bg-background-light border-2 border-foreground/10 rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow'
            >
              {/* Item image */}
              <div className='h-24 w-24 bg-foreground/5 shrink-0 overflow-hidden'>
                {item.pictures.length > 0 ? (
                  <Image
                    src={item.pictures[0]}
                    alt='Market listing picture'
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
                  <h3 className='font-medium'>{item.title}</h3>
                  <p className='text-lg font-mono font-bold'>
                    {formatCurrency(item.priceInCents)}
                  </p>
                </div>

                <p className='text-sm mt-1 line-clamp-2 text-foreground/70'>
                  {item.description}
                </p>

                <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-2'>
                  <span className='text-sm text-foreground/70'>
                    Seller: {item.author?.username ?? item.author.id.toString()}
                  </span>

                  <span className='text-sm flex items-center text-foreground/70'>
                    ★ {0} ({0} reviews)
                  </span>

                  <span className='text-sm text-foreground/70'>
                    Location: {item.countries.join(', ')}
                  </span>

                  <span className='text-sm text-foreground/70'>
                    Listed: {dayjs(item.listedAt).fromNow()}
                  </span>
                </div>

                <div className='flex mt-3 gap-2'>
                  <button
                    className='button py-1 px-3 h-auto flex items-center gap-1'
                    onClick={() => openChat(item)}
                  >
                    <FiMessageCircle size={14} />
                    <span>Chat</span>
                  </button>

                  {/* Conditional rendering based on whether user is seller */}
                  {item.author.id.toString() === api.user?.id ? (
                    <button
                      className='button-primary py-1 px-3 h-auto flex items-center gap-1'
                      onClick={(e) => {
                        e.stopPropagation() // Prevent triggering parent onClick
                        setEditingListing(item)
                      }}
                    >
                      <span>Edit</span>
                    </button>
                  ) : (
                    <button
                      className='button-primary py-1 px-3 h-auto flex items-center gap-1'
                      onClick={() => openBuyModal(item)}
                    >
                      <FiShoppingCart size={14} />
                      <span>Buy</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
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

      {/* Pagination */}
      {listings && listings.data.length > 0 && (
        <div className='mt-8 flex justify-center'>
          <div className='flex border-2 border-foreground/10 rounded-md overflow-hidden'>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 sm:px-4 py-2 border-r-2 border-foreground/10 flex items-center ${
                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiChevronLeft className='mr-1' />
            </button>

            <div className='flex'>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 sm:px-4 py-2 ${
                    currentPage === i + 1
                      ? 'bg-foreground text-background'
                      : 'hover:bg-background-light'
                  }`}
                >
                  {i + 1}
                </button>
              )).slice(
                // Show a window of 5 pages or fewer if there aren't enough pages
                Math.max(0, Math.min(currentPage - 3, totalPages - 5)),
                Math.min(totalPages, Math.max(5, currentPage + 2)),
              )}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 sm:px-4 py-2 border-l-2 border-foreground/10 flex items-center ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Items per page selector */}
      {listings && listings?.data.length > 0 && (
        <div className='mt-4 text-center'>
          <div className='flex flex-col sm:flex-row justify-center items-center gap-2'>
            <div className='flex items-center'>
              <span className='text-sm text-foreground/70'>
                Items per page:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1) // Reset to first page when changing items per page
                }}
                className='ml-2 px-2 py-1 border-2 border-foreground/10 rounded-md text-black'
              >
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={32}>32</option>
              </select>
            </div>

            <span className='text-sm text-foreground/70 sm:ml-4'>
              {listings
                ? `Showing ${indexOfFirstItem + 1}-${Math.min(
                    indexOfLastItem + 1,
                    listings.data.length,
                  )} of ${listings.data.length} items`
                : 'Showing -- of -- items'}
            </span>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {isBuyModalOpen && buyingListing && (
        <div className='fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-background rounded-lg w-full max-w-screen-sm md:max-w-2xl mx-4 md:mx-auto shadow-xl overflow-hidden'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold'>
                {purchaseStep === 'confirm'
                  ? 'Purchase Item'
                  : purchaseStep === 'payment'
                  ? 'Payment Details'
                  : 'Order Complete'}
              </h2>

              {purchaseStep !== 'complete' && (
                <button
                  onClick={() => setIsBuyModalOpen(false)}
                  className='p-1 hover:bg-background-dark rounded-full'
                >
                  <FiX size={24} />
                </button>
              )}
            </div>

            {purchaseStep === 'confirm' && (
              <div className='space-y-4'>
                <div className='flex gap-4 items-start'>
                  {/* Image placeholder */}{' '}
                  <div className='h-24 w-24 bg-foreground/5 shrink-0 overflow-hidden'>
                    {buyingListing.pictures.length > 0 ? (
                      <Image
                        width={96}
                        height={96}
                        src={buyingListing.pictures[0]}
                        alt='Market listing picture'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='h-full w-full flex items-center justify-center'>
                        <span className='text-foreground/30'>Image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className='font-medium text-lg'>
                      {buyingListing.title}
                    </h3>
                    <p className='text-foreground/70 text-sm mb-1'>
                      {buyingListing.description}
                    </p>
                    <div className='flex items-center text-sm'>
                      <span>
                        Seller:{' '}
                        {buyingListing.author.username ??
                          buyingListing.author.id.toString()}
                      </span>
                      <span className='mx-2'>•</span>
                      <span className='flex items-center'>★ {0}</span>
                    </div>
                  </div>
                </div>

                <div className='border-t-2 border-b-2 border-foreground/10 py-4 my-4'>
                  <div className='flex justify-between mb-2'>
                    <span>Item price</span>
                    <span className='font-mono font-bold'>
                      {formatCurrency(buyingListing.priceInCents)}
                    </span>
                  </div>
                  <div className='flex justify-between mb-2'>
                    <span>Platform fee</span>
                    <span className='font-mono'>$10.00</span>
                  </div>
                  <div className='flex justify-between mb-2'>
                    <span>Shipping</span>
                    <span className='font-mono'>$8.50</span>
                  </div>
                  <div className='flex justify-between font-bold mt-4 pt-2 border-t border-foreground/10'>
                    <span>Total</span>
                    <span className='font-mono'>
                      {formatCurrency(buyingListing.priceInCents + 1000 + 850)}
                    </span>
                  </div>
                </div>

                <div className='flex justify-end gap-3'>
                  <button
                    onClick={() => setIsBuyModalOpen(false)}
                    className='button px-5'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchase}
                    className='button-primary px-5'
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            {purchaseStep === 'payment' && (
              <div className='space-y-4'>
                <p className='text-foreground/70 mb-4'>
                  Please enter your payment details to complete the purchase.
                </p>

                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Card Number
                    </label>
                    <div className='relative'>
                      <input
                        type='text'
                        className='w-full p-2 border-2 border-foreground/10 rounded-md pl-10'
                        placeholder='1234 5678 9012 3456'
                      />
                      <FiCreditCard className='absolute left-3 top-2.5 text-foreground/50' />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='block text-sm font-medium mb-1'>
                        Expiry Date
                      </label>
                      <input
                        type='text'
                        className='w-full p-2 border-2 border-foreground/10 rounded-md'
                        placeholder='MM/YY'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium mb-1'>
                        CVC
                      </label>
                      <input
                        type='text'
                        className='w-full p-2 border-2 border-foreground/10 rounded-md'
                        placeholder='123'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Name on Card
                    </label>
                    <input
                      type='text'
                      className='w-full p-2 border-2 border-foreground/10 rounded-md'
                      placeholder='John Doe'
                    />
                  </div>
                </div>

                <div className='flex justify-between items-center py-4 mt-2 border-t-2 border-foreground/10'>
                  <div>
                    <p className='font-bold'>Total to pay:</p>
                    <p className='font-mono font-bold text-lg'>
                      {formatCurrency(buyingListing.priceInCents + 1000 + 850)}
                    </p>
                  </div>
                  <button
                    onClick={handlePurchase}
                    className='button-primary px-5'
                  >
                    Complete Purchase
                  </button>
                </div>
              </div>
            )}

            {purchaseStep === 'complete' && (
              <div className='text-center py-6'>
                <div className='flex justify-center mb-4'>
                  <FiCheckCircle size={64} className='text-green-500' />
                </div>
                <h3 className='text-xl font-bold mb-2'>Purchase Successful!</h3>
                <p className='text-foreground/70 mb-6'>
                  Thank you for your purchase. The seller has been notified.
                </p>
                <div className='bg-background-light p-4 rounded-lg border-2 border-foreground/10 mb-6'>
                  <p className='font-medium'>{buyingListing.title}</p>
                  <p className='font-mono font-bold'>
                    {formatCurrency(buyingListing.priceInCents)}
                  </p>
                  <p className='text-sm text-foreground/70'>
                    Order #:{' '}
                    {Math.floor(Math.random() * 1000000)
                      .toString()
                      .padStart(6, '0')}
                  </p>
                </div>
                <button
                  onClick={() => setIsBuyModalOpen(false)}
                  className='button-primary px-5'
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Chat Bubble */}
      {isChatOpen && selectedListing && (
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
            {chatMessages.map((msg, i) => (
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

                  {msg.type === 'listing' && msg.listing && (
                    <div className='bg-background-light rounded p-2 space-y-1'>
                      <div className='flex justify-between'>
                        <p className='text-sm font-medium text-foreground'>
                          {msg.listing.title}
                        </p>
                        <p className='text-sm font-mono font-bold text-foreground'>
                          {formatCurrency(msg.listing.priceInCents)}
                        </p>
                      </div>
                      <div className='h-16 bg-foreground/5 flex items-center justify-center text-xs text-foreground/30'>
                        Item Image
                      </div>
                      <p className='text-xs text-foreground'>{msg.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
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

      {/* Detailed Listing Modal */}
      {isDetailModalOpen && detailedListing && (
        <div className='fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-background rounded-lg max-w-3xl w-full shadow-xl border-2 border-foreground/10 max-h-[90vh] flex flex-col'>
            {/* Modal Header */}
            <div className='flex justify-between items-center p-4 border-b border-foreground/10 shrink-0'>
              <h2 className='text-xl font-bold truncate'>
                {detailedListing.title}
              </h2>
              <button
                onClick={closeDetailModal}
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
                    <span className='text-foreground/30 text-lg'>
                      Item Images
                    </span>
                  </div>

                  {/* Thumbnail Row */}
                  <div className='grid grid-cols-5 gap-2'>
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className='bg-foreground/5 rounded-md h-12 flex items-center justify-center cursor-pointer hover:border-2 hover:border-foreground/30'
                      >
                        <span className='text-foreground/30 text-xs'>
                          {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Item Details */}
                <div className='md:col-span-1 flex flex-col'>
                  {/* Price and Actions */}
                  <div className='mb-4'>
                    <div className='flex justify-between items-center mb-3'>
                      <p className='text-2xl font-mono font-bold'>
                        {formatCurrency(detailedListing.priceInCents)}
                      </p>
                      <div className='flex items-center gap-2'>
                        <button className='text-foreground/50 hover:text-red-500'>
                          <FiHeart size={20} />
                        </button>
                        {/* Mock check to simulate if user is the owner */}
                        {detailedListing.author.id.toString() ===
                          api.user?.id && (
                          <button
                            onClick={() => {
                              closeDetailModal()
                              setEditingListing(detailedListing)
                            }}
                            className='text-foreground/50 hover:text-blue-500'
                          >
                            <span className='text-sm'>Edit</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <button
                        onClick={() => {
                          closeDetailModal()
                          openBuyModal(detailedListing)
                        }}
                        className='button-primary w-full py-2 flex items-center justify-center gap-2 text-sm'
                      >
                        <FiShoppingCart size={16} />
                        Buy Now
                      </button>

                      <button
                        onClick={() => {
                          closeDetailModal()
                          openChat(detailedListing)
                        }}
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
                        {(
                          detailedListing.author.username ??
                          detailedListing.author.id.toString()
                        )
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className='font-medium text-sm'>
                          {detailedListing.author.username ??
                            detailedListing.author.id.toString()}
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
                      <p className='font-medium'>
                        {detailedListing.countries.join(', ')}
                      </p>
                    </div>

                    <div>
                      <p className='text-xs text-foreground/70'>Listed</p>
                      <p className='font-medium'>
                        {dayjs(detailedListing.listedAt).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className='mt-6 border-t border-foreground/10 pt-6'>
                <h3 className='text-lg font-bold mb-3'>Description</h3>
                <p className='whitespace-pre-line text-foreground/90 text-sm'>
                  {detailedListing.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Favorites Modal */}
      {showFavorites && (
        <div className='fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-background rounded-lg w-full max-w-4xl shadow-xl border-2 border-foreground/10 my-8 mx-2 max-h-[90vh] flex flex-col overflow-hidden'>
            {/* Modal Header - Added rounded-t-lg to match parent container's top corners */}
            <div className='flex justify-between items-center p-4 sm:p-6 border-b border-foreground/10 sticky top-0 bg-background z-10 rounded-t-lg'>
              <h2 className='text-xl sm:text-2xl font-bold'>Favorites</h2>
              <button
                onClick={() => setShowFavorites(false)}
                className='p-1 hover:bg-background-dark rounded-full'
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body - Scrollable Content */}
            <div className='p-4 sm:p-6 overflow-y-auto flex-1'>
              {favorites.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-4'>
                  {favorites.map((item) => (
                    <div
                      key={item.id.toString()}
                      className='bg-background-light border-2 border-foreground/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                      onClick={() => {
                        setDetailedListing(item)
                        setIsDetailModalOpen(true)
                        setShowFavorites(false)
                      }}
                    >
                      {/* Image placeholder */}
                      <div className='h-48 bg-foreground/5 flex items-center justify-center'>
                        <span className='text-foreground/30'>Item Image</span>
                      </div>

                      <div className='p-4'>
                        <div className='flex justify-between items-start'>
                          <h3 className='font-medium'>{item.title}</h3>
                          <button
                            className='text-red-500'
                            onClick={(e) => {
                              e.stopPropagation() // Prevent triggering parent onClick
                              setFavorites(
                                favorites.filter((fav) => fav.id !== item.id),
                              )
                            }}
                          >
                            <FiHeart className='fill-current' />
                          </button>
                        </div>

                        <p className='text-lg font-mono font-bold mt-1'>
                          {formatCurrency(item.priceInCents)}
                        </p>

                        <div className='flex items-center text-sm mt-1 text-foreground/70'>
                          <span className='flex items-center'>★ {0}</span>
                          <span className='mx-1'>•</span>
                          <span>{0} reviews</span>
                        </div>

                        <p className='text-sm mt-1 text-foreground/70'>
                          Seller:{' '}
                          {item.author.username ?? item.author.id.toString()}
                        </p>

                        <div className='flex flex-col mt-4'>
                          <span className='text-xs text-foreground/50 mb-2'>
                            {dayjs(item.listedAt).fromNow()}
                          </span>
                          <div className='flex justify-between'>
                            <button
                              className='button py-1 px-3 h-auto flex items-center gap-1 flex-1 mr-1 justify-center'
                              onClick={(e) => {
                                e.stopPropagation() // Prevent triggering parent onClick
                                openChat(item)
                                setShowFavorites(false)
                              }}
                            >
                              <FiMessageCircle size={14} />
                              <span>Chat</span>
                            </button>
                            <button
                              className='button-primary py-1 px-3 h-auto flex items-center gap-1 flex-1 ml-1 justify-center'
                              onClick={(e) => {
                                e.stopPropagation() // Prevent triggering parent onClick
                                openBuyModal(item)
                                setShowFavorites(false)
                              }}
                            >
                              <FiShoppingCart size={14} />
                              <span>Buy</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-6 sm:py-10'>
                  <FiHeart
                    size={48}
                    className='mx-auto mb-4 text-foreground/30'
                  />
                  <h3 className='text-xl font-bold mb-2'>No favorites yet</h3>
                  <p className='text-foreground/70 mb-6'>
                    Items you favorite will appear here for easy access
                  </p>
                  <button
                    onClick={() => setShowFavorites(false)}
                    className='button-primary'
                  >
                    Browse Marketplace
                  </button>
                </div>
              )}
            </div>

            {/* Clear All Button - Fixed at bottom outside of scrollable area */}
            {favorites.length > 0 && (
              <div className='border-t border-foreground/10 p-4 bg-background rounded-b-lg shadow-inner'>
                <div className='flex justify-end'>
                  <button
                    onClick={() => {
                      if (
                        confirm('Are you sure you want to clear all favorites?')
                      ) {
                        setFavorites([])
                      }
                    }}
                    className='button text-red-500'
                  >
                    Clear All Favorites
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Listing Form Modal */}
      {(isCreateListingOpen || editingListing) && (
        <CreateListingForm
          onClose={() => {
            setIsCreateListingOpen(false)
            setEditingListing(null)
          }}
          onSuccess={(listingId) => {
            setIsCreateListingOpen(false)
            setEditingListing(null)
            // In a real app, you might refresh the listings or navigate to the new listing
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
                  priceInCents: editingListing.priceInCents / 100,
                  category: 'jade', // editingListing.category,
                  countries: editingListing.countries,
                }
              : undefined
          }
          listingId={editingListing ? editingListing.id.toString() : undefined}
          isEditing={!!editingListing}
        />
      )}
    </div>
  )
}

export default Marketplace
