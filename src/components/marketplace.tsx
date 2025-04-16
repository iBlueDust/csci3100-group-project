import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiGrid, FiList, FiChevronDown, FiHeart, FiShoppingCart, FiChevronLeft, FiChevronRight, FiMessageCircle, FiX, FiPaperclip, FiCreditCard, FiCheckCircle, FiMapPin, FiPlus } from 'react-icons/fi'
import { countries, getFeaturedCountries } from '@/utils/countries'
import { mockListings, mockUserListings } from '@/data/mock/listings'
import CreateListingForm from './CreateListingForm'

// Mock categories
const categories = [
  { id: 'all', name: 'All Items' },
  { id: 'jade', name: 'Jade Items' },
  { id: 'antiques', name: 'Antiques' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'art', name: 'Artwork' },
  { id: 'gems', name: 'Precious Gems' }
]
  // Countries are now imported from @/utils/countries

// Add interface for the Marketplace component props
interface MarketplaceProps {
  initialSelectedListingId?: number | null;
}

export default function Marketplace({ initialSelectedListingId }: MarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [totalPages, setTotalPages] = useState(1)
  
  // Pagination parameters for API queries
  // skip - type: int, required: no, description: number of listings at the front of the list to skip. defaults to 0
  const skip = (currentPage - 1) * itemsPerPage
  // limit - type: int, required: no, description: maximum number of listings to send back. defaults to 20
  const limit = itemsPerPage

  // Favorites state
  const [favorites, setFavorites] = useState<typeof mockListings>([])
  const [showFavorites, setShowFavorites] = useState(false)

  // Add state for detailed listing modal
  const [detailedListing, setDetailedListing] = useState<typeof mockListings[0] | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Function to open detailed listing modal
  const openDetailModal = (item: typeof mockListings[0]) => {
    setDetailedListing(item);
    setIsDetailModalOpen(true);
  };

  // Function to close detailed listing modal
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailedListing(null);
  };
  
  // Chat bubble state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<typeof mockListings[0] | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'text' | 'attachment' | 'listing', content: string, sender: 'user' | 'other', listing?: typeof mockListings[0] }>>([]);

  // Open chat with a specific listing
  const openChat = (item: typeof mockListings[0]) => {
    setSelectedListing(item);
    setIsChatOpen(true);

    // Demo: Add the listing as a message in the chat
    setChatMessages([
      ...chatMessages,
      {
        type: 'listing',
        content: `I'm interested in ${item.title}`,
        sender: 'user',
        listing: item
      }
    ]);
  };

  // Send a message in the chat
  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          type: 'text',
          content: chatMessage,
          sender: 'user'
        }
      ]);
      setChatMessage('');

      // Demo: Mock response from the seller
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            type: 'text',
            content: `Thanks for your interest in my item! Would you like more information?`,
            sender: 'other'
          }
        ]);
      }, 1000);
    }
  };

  // Simulate sending an attachment
  const sendAttachment = () => {
    setChatMessages([
      ...chatMessages,
      {
        type: 'attachment',
        content: 'image_attachment.jpg',
        sender: 'user'
      }
    ]);
  };

  // Create listing form state
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<typeof mockListings[0] | null>(null);
  
  // Buy modal state
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyingListing, setBuyingListing] = useState<typeof mockListings[0] | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'confirm' | 'payment' | 'complete'>('confirm');

  // Open buy modal with a specific listing
  const openBuyModal = (item: typeof mockListings[0]) => {
    setBuyingListing(item);
    setIsBuyModalOpen(true);
    setPurchaseStep('confirm');
  };

  // Handle the purchase flow
  const handlePurchase = () => {
    if (purchaseStep === 'confirm') {
      setPurchaseStep('payment');
    } else if (purchaseStep === 'payment') {
      // In a real app, you would process the payment here
      setPurchaseStep('complete');
      // Simulate completion after 2 seconds
      setTimeout(() => {
        setIsBuyModalOpen(false);
        setBuyingListing(null);
        setPurchaseStep('confirm');
        // Show success message or notification
        alert('Purchase completed successfully!');
      }, 2000);
    }
  };

  // Filter and sort listings
  const allListings = [...mockListings, ...mockUserListings];
  const filteredListings = allListings
    .filter(listing => {
      // Search filter
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           listing.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
      
      // Country filter
      const matchesCountry = selectedCountry === 'all' || listing.location.toLowerCase().includes(selectedCountry.toLowerCase());
      
      // Price filter
      const matchesMinPrice = !minPrice || parseFloat(listing.price.substring(1).replace(',', '')) >= parseFloat(minPrice);
      const matchesMaxPrice = !maxPrice || parseFloat(listing.price.substring(1).replace(',', '')) <= parseFloat(maxPrice);
      
      return matchesSearch && matchesCategory && matchesCountry && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      // Sort options
      if (sortOption === 'newest') {
        return a.id < b.id ? 1 : -1; // Using ID as a proxy for newest for this mock
      } else if (sortOption === 'price_low') {
        return parseFloat(a.price.substring(1).replace(',', '')) - parseFloat(b.price.substring(1).replace(',', ''));
      } else if (sortOption === 'price_high') {
        return parseFloat(b.price.substring(1).replace(',', '')) - parseFloat(a.price.substring(1).replace(',', ''));
      } else if (sortOption === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredListings.slice(indexOfFirstItem, indexOfLastItem);
  
  // Update total pages when filtered listings change
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredListings.length / itemsPerPage)));
    if (currentPage > Math.ceil(filteredListings.length / itemsPerPage) && filteredListings.length > 0) {
      setCurrentPage(1);
    }
  }, [filteredListings, itemsPerPage]);

  // Event listeners for favorites functionality from the header button
  useEffect(() => {
    const handleToggleFavorites = () => {
      setShowFavorites(prev => !prev);
    };

    const handleShowFavorites = () => {
      setShowFavorites(true);
    };

    window.addEventListener('toggle-favorites', handleToggleFavorites);
    window.addEventListener('show-favorites', handleShowFavorites);

    return () => {
      window.removeEventListener('toggle-favorites', handleToggleFavorites);
      window.removeEventListener('show-favorites', handleShowFavorites);
    };
  }, []);

  // Local storage for favorites persistence
  useEffect(() => {
    // Load favorites from localStorage on component mount
    const storedFavorites = localStorage.getItem('marketplace-favorites');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites from localStorage', e);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('marketplace-favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // Handle initialSelectedListingId to open detailed listing view when navigating from Home
  useEffect(() => {
    if (initialSelectedListingId) {
      const listing = mockListings.find(item => item.id === initialSelectedListingId);
      if (listing) {
        openDetailModal(listing);
      }
    }
  }, [initialSelectedListingId]);

  // Change page
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    // Reset to first page when performing a new search
    setCurrentPage(1);
    // Additional search logic could be added here if needed
    // For example, API calls or analytics tracking
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2">Marketplace</h2>
          <p className="text-foreground/70">Browse, buy, and trade with trusted sellers on The Jade Trail</p>
        </div>
        <button 
          className="button-primary h-auto py-2 px-5"
          onClick={() => setIsCreateListingOpen(true)}
        ><FiPlus />
            <span>Create New Listing</span>
        </button>
      </div>

      {/* Search and filter bar */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 pr-12 border-2 border-foreground/10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              onClick={handleSearch}
              className="absolute right-0 top-0 h-full px-4 rounded-r-md bg-gray-500 hover:bg-black flex items-center justify-center border-l-0 border-2 border-foreground/10 dark:border-white"
              aria-label="Search"
            >
              <FiSearch className="text-white" />
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="h-full px-4 py-2 border-2 border-foreground/10 rounded-md appearance-none pr-8 bg-background"
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <FiChevronDown className="absolute right-3 top-3 pointer-events-none text-foreground/50" />
            </div>

            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-foreground/10' : ''}`}
            >
              <FiGrid />
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-foreground/10' : ''}`}
            >
              <FiList />
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 p-2 rounded-md ${showFilters ? 'bg-foreground/10' : ''}`}
            >
              <FiFilter />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="mt-4 p-4 border-2 border-foreground/10 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        id={category.id}
                        name="category"
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                        className="mr-2"
                      />
                      <label htmlFor={category.id}>{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Location</h4>
                <div className="relative">
                  <div className="flex items-center">
                    <FiMapPin className="absolute left-3 top-2.5 text-foreground/50" />
                    <select 
                      value={selectedCountry} 
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full p-2 pl-10 border-2 border-foreground/10 rounded-md appearance-none bg-background pr-10"
                    >
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3 pointer-events-none text-foreground/50" />
                  </div>
                </div>
                
                {/* Featured regions section for quick selection */}
                <div className="mt-4">
                  <h5 className="text-sm text-foreground/70 mb-2">Featured Regions</h5>
                  <div className="flex flex-wrap gap-2">
                    {['HK', 'CN', 'TW', 'SG', 'US', 'GB'].map(code => {
                      const country = countries.find(c => c.id === code);
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
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 border-2 border-foreground/10 rounded-md"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 border-2 border-foreground/10 rounded-md"
                  />
                </div>
              </div>

              <div className="flex items-end md:col-span-3">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedCountry('all');
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  className="button w-full"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-1 rounded-full text-sm ${selectedCategory === category.id 
                ? 'bg-foreground text-background' 
                : 'bg-background-light border-2 border-foreground/10'
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="mb-4 text-foreground/70">
        Showing {filteredListings.length} {filteredListings.length === 1 ? 'result' : 'results'}
      </p>

      {/* Item grid/list */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map(item => (
            <div 
              key={item.id} 
              className="bg-background-light border-2 border-foreground/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-[595px] flex flex-col"
              onClick={() => openDetailModal(item)}
            >
              {/* Item image - fixed height */}
              <div className="h-48 bg-foreground/5 overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-foreground/30">Item Image</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium truncate max-w-[85%]" title={item.title}>{item.title}</h3>
                  <button 
                    className={`flex-shrink-0 ${favorites.find(fav => fav.id === item.id) ? 'text-red-500' : 'text-foreground/50 hover:text-red-500'}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering parent onClick
                      // Add to favorites logic
                      if (favorites.find(fav => fav.id === item.id)) {
                        setFavorites(favorites.filter(fav => fav.id !== item.id));
                      } else {
                        setFavorites([...favorites, item]);
                      }
                    }}
                  >
                    <FiHeart className={favorites.find(fav => fav.id === item.id) ? 'fill-current' : ''} />
                  </button>
                </div>

                <p className="text-lg font-mono font-bold mt-1">{item.price}</p>

                <div className="flex items-center text-sm mt-1 text-foreground/70">
                  <span className="flex items-center">
                    ★ {item.rating}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{item.reviews} reviews</span>
                </div>

                <p className="text-sm mt-1 text-foreground/70 line-clamp-1" title={`Seller: ${item.seller}`}>
                  Seller: {item.seller}
                </p>
                
                {/* Add description with line clamp */}
                <p className="text-sm mt-2 text-foreground/70 line-clamp-2 flex-grow" title={item.description}>
                  {item.description}
                </p>

                {/* Push buttons to the bottom with mt-auto */}
                <div className="flex flex-col mt-auto pt-4 pb-4">
                  <span className="text-xs text-foreground/50 mb-3">Listed: {item.listed}</span>
                  <div className="flex justify-between">
                    {/* Only show chat button for listings where user is not the seller */}
                    {item.seller !== 'You' ? (
                      <button
                        className="button py-1.5 px-3 h-auto flex items-center gap-1 flex-1 mr-1 justify-center"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering parent onClick
                          openChat(item);
                        }}
                      >
                        <FiMessageCircle size={14} />
                        <span>Chat</span>
                      </button>
                    ) : (
                      <button 
                        className="button py-1.5 px-3 h-auto flex items-center gap-1 flex-1 mr-1 justify-center text-red-500"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering parent onClick
                          if(confirm(`Are you sure you want to delete "${item.title}"?`)) {
                            // In a real app, this would call an API to delete the listing
                            alert(`Listing "${item.title}" has been deleted.`);
                            // You would typically refresh the listings after deletion
                          }
                        }}
                      >
                        <span>Delete</span>
                      </button>
                    )}
                    {/* Show different buttons based on whether user is the seller */}
                    {item.seller === 'You' ? (
                      <button 
                        className="button-primary py-1.5 px-3 h-auto flex items-center gap-1 flex-1 ml-1 justify-center"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering parent onClick
                          setEditingListing(item);
                        }}
                      >
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button 
                        className="button-primary py-1.5 px-3 h-auto flex items-center gap-1 flex-1 ml-1 justify-center"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering parent onClick
                          openBuyModal(item);
                        }}
                      >
                        <FiShoppingCart size={14} />
                        <span>Buy</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {currentItems.map(item => (
            <div 
              key={item.id} 
              className="bg-background-light border-2 border-foreground/10 rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow"
            >
              {/* Item image */}
              <div className="h-24 w-24 bg-foreground/5 shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-foreground/30">Image</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-lg font-mono font-bold">{item.price}</p>
                </div>

                <p className="text-sm mt-1 line-clamp-2 text-foreground/70">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  <span className="text-sm text-foreground/70">
                    Seller: {item.seller}
                  </span>

                  <span className="text-sm flex items-center text-foreground/70">
                    ★ {item.rating} ({item.reviews} reviews)
                  </span>

                  <span className="text-sm text-foreground/70">
                    Location: {item.location}
                  </span>

                  <span className="text-sm text-foreground/70">
                    Listed: {item.listed}
                  </span>
                </div>

                <div className="flex mt-3 gap-2">
                  <button
                    className="button py-1 px-3 h-auto flex items-center gap-1"
                    onClick={() => openChat(item)}
                  >
                    <FiMessageCircle size={14} />
                    <span>Chat</span>
                  </button>
                  {/* Conditional rendering based on whether user is seller */}
                  {item.seller === 'You' ? (
                    <button 
                      className="button-primary py-1 px-3 h-auto flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering parent onClick
                        setEditingListing(item);
                      }}
                    >
                      <span>Edit</span>
                    </button>
                  ) : (
                    <button 
                      className="button-primary py-1 px-3 h-auto flex items-center gap-1"
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
      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/50 text-lg">No items found matching your criteria</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setMinPrice('');
              setMaxPrice('');
            }}
            className="button mt-4"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredListings.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex border-2 border-foreground/10 rounded-md overflow-hidden">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className={`px-4 py-2 border-r-2 border-foreground/10 flex items-center ${
                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiChevronLeft className="mr-1" />
              Previous
            </button>

            <div className="flex">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-4 py-2 ${currentPage === i + 1
                    ? 'bg-foreground text-background'
                    : 'hover:bg-background-light'
                    }`}
                >
                  {i + 1}
                </button>
              )).slice(
                // Show a window of 5 pages or fewer if there aren't enough pages
                Math.max(0, Math.min(currentPage - 3, totalPages - 5)),
                Math.min(totalPages, Math.max(5, currentPage + 2))
              )}
            </div>

            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className={`px-4 py-2 border-l-2 border-foreground/10 flex items-center ${
                currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Next
              <FiChevronRight className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Items per page selector */}
      {filteredListings.length > 0 && (
        <div className="mt-4 text-center flex justify-center items-center gap-2">
          <span className="text-sm text-foreground/70">Items per page:</span>
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
            className="px-2 py-1 border-2 border-foreground/10 rounded-md text-black"
          >
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={32}>32</option>
          </select>
          <span className="text-sm text-foreground/70 ml-4">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredListings.length)} of {filteredListings.length} items
          </span>
        </div>
      )}

      {/* Buy Modal */}
      {isBuyModalOpen && buyingListing && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-lg w-full shadow-xl border-2 border-foreground/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {purchaseStep === 'confirm' ? 'Purchase Item' : 
                 purchaseStep === 'payment' ? 'Payment Details' : 'Order Complete'}
              </h2>
              
              {purchaseStep !== 'complete' && (
                <button 
                  onClick={() => setIsBuyModalOpen(false)} 
                  className="p-1 hover:bg-background-dark rounded-full"
                >
                  <FiX size={24} />
                </button>
              )}
            </div>
            
            {purchaseStep === 'confirm' && (
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  {/* Image placeholder */}                <div className="h-24 w-24 bg-foreground/5 shrink-0 overflow-hidden">
                  {buyingListing.image ? (
                    <img src={buyingListing.image} alt={buyingListing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-foreground/30">Image</span>
                    </div>
                  )}
                </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">{buyingListing.title}</h3>
                    <p className="text-foreground/70 text-sm mb-1">{buyingListing.description}</p>
                    <div className="flex items-center text-sm">
                      <span>Seller: {buyingListing.seller}</span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">★ {buyingListing.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t-2 border-b-2 border-foreground/10 py-4 my-4">
                  <div className="flex justify-between mb-2">
                    <span>Item price</span>
                    <span className="font-mono font-bold">{buyingListing.price}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Platform fee</span>
                    <span className="font-mono">$10.00</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Shipping</span>
                    <span className="font-mono">$8.50</span>
                  </div>
                  <div className="flex justify-between font-bold mt-4 pt-2 border-t border-foreground/10">
                    <span>Total</span>
                    <span className="font-mono">${(
                      parseFloat(buyingListing.price.replace('$', '').replace(',', '')) + 
                      10.00 + 
                      8.50
                    ).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setIsBuyModalOpen(false)} 
                    className="button px-5"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePurchase} 
                    className="button-primary px-5"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}
            
            {purchaseStep === 'payment' && (
              <div className="space-y-4">
                <p className="text-foreground/70 mb-4">Please enter your payment details to complete the purchase.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full p-2 border-2 border-foreground/10 rounded-md pl-10"
                        placeholder="1234 5678 9012 3456"
                      />
                      <FiCreditCard className="absolute left-3 top-2.5 text-foreground/50" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiry Date</label>
                      <input
                        type="text"
                        className="w-full p-2 border-2 border-foreground/10 rounded-md"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CVC</label>
                      <input
                        type="text"
                        className="w-full p-2 border-2 border-foreground/10 rounded-md"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Name on Card</label>
                    <input
                      type="text"
                      className="w-full p-2 border-2 border-foreground/10 rounded-md"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-4 mt-2 border-t-2 border-foreground/10">
                  <div>
                    <p className="font-bold">Total to pay:</p>
                    <p className="font-mono font-bold text-lg">${(
                      parseFloat(buyingListing.price.replace('$', '').replace(',', '')) + 
                      10.00 + 
                      8.50
                    ).toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={handlePurchase} 
                    className="button-primary px-5"
                  >
                    Complete Purchase
                  </button>
                </div>
              </div>
            )}
            
            {purchaseStep === 'complete' && (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <FiCheckCircle size={64} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Purchase Successful!</h3>
                <p className="text-foreground/70 mb-6">Thank you for your purchase. The seller has been notified.</p>
                <div className="bg-background-light p-4 rounded-lg border-2 border-foreground/10 mb-6">
                  <p className="font-medium">{buyingListing.title}</p>
                  <p className="font-mono font-bold">{buyingListing.price}</p>
                  <p className="text-sm text-foreground/70">Order #: {Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</p>
                </div>
                <button 
                  onClick={() => setIsBuyModalOpen(false)} 
                  className="button-primary px-5"
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
        <div className="fixed bottom-4 right-4 w-80 md:w-96 h-96 bg-background border-2 border-black dark:border-[#343434] rounded-lg shadow-xl flex flex-col z-50">
          {/* Chat Header */}
          <div className="flex justify-between items-center p-3 border-b border-l border-r border-foreground/10 bg-background-light rounded-t-lg"> {/* Added border-l, border-r, and rounded-t-lg */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground">
                {selectedListing.seller.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{selectedListing.seller}</p>
                <p className="text-xs text-foreground/70 truncate">{selectedListing.title}</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-foreground/70 hover:text-foreground">
              <FiX size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 ${msg.sender === 'user'
                      ? 'bg-black text-white border-2 border-foreground/20'
                      : 'bg-white text-black border-2 border-foreground/20'
                    }`}
                >
                  {msg.type === 'text' && (
                    <p className="text-sm">{msg.content}</p>
                  )}

                  {msg.type === 'attachment' && (
                    <div className="flex items-center gap-2 bg-background-light rounded p-2">
                      <FiPaperclip size={14} />
                      <span className="text-sm">{msg.content}</span>
                    </div>
                  )}

                  {msg.type === 'listing' && msg.listing && (
                    <div className="bg-background-light rounded p-2 space-y-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-foreground">{msg.listing.title}</p>
                        <p className="text-sm font-mono font-bold text-foreground">{msg.listing.price}</p>
                      </div>
                      <div className="h-16 bg-foreground/5 flex items-center justify-center text-xs text-foreground/30">
                        Item Image
                      </div>
                      <p className="text-xs text-foreground">{msg.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-foreground/10 flex gap-2">
            <button
              onClick={sendAttachment}
              className="p-2 text-foreground/70 hover:text-foreground"
            >
              <FiPaperclip size={20} />
            </button>
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 py-2 px-3 border-2 border-foreground/20 rounded-full bg-background"
            />
            <button
              onClick={sendChatMessage}
              className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-50"
              disabled={!chatMessage.trim()}
            >
              <FiMessageCircle size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Detailed Listing Modal */}
      {isDetailModalOpen && detailedListing && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-3xl w-full shadow-xl border-2 border-foreground/10 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-foreground/10 shrink-0">
              <h2 className="text-xl font-bold truncate">{detailedListing.title}</h2>
              <button 
                onClick={closeDetailModal} 
                className="p-1 hover:bg-background-dark rounded-full"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="p-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image Gallery */}
                <div className="md:col-span-2 space-y-3">
                  {/* Main Image */}
                  <div className="bg-foreground/5 rounded-lg h-64 flex items-center justify-center">
                    <span className="text-foreground/30 text-lg">Item Images</span>
                  </div>
                  
                  {/* Thumbnail Row */}
                  <div className="grid grid-cols-5 gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-foreground/5 rounded-md h-12 flex items-center justify-center cursor-pointer hover:border-2 hover:border-foreground/30"
                      >
                        <span className="text-foreground/30 text-xs">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Item Details */}
                <div className="md:col-span-1 flex flex-col">
                  {/* Price and Actions */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-2xl font-mono font-bold">{detailedListing.price}</p>
                      <div className="flex items-center gap-2">
                        <button className="text-foreground/50 hover:text-red-500">
                          <FiHeart size={20} />
                        </button>
                        {/* Mock check to simulate if user is the owner */}
                        {detailedListing.seller === 'You' && (
                          <button 
                            onClick={() => {
                              closeDetailModal();
                              setEditingListing(detailedListing);
                            }}
                            className="text-foreground/50 hover:text-blue-500"
                          >
                            <span className="text-sm">Edit</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          closeDetailModal();
                          openBuyModal(detailedListing);
                        }}
                        className="button-primary w-full py-2 flex items-center justify-center gap-2 text-sm"
                      >
                        <FiShoppingCart size={16} />
                        Buy Now
                      </button>
                      
                      <button 
                        onClick={() => {
                          closeDetailModal();
                          openChat(detailedListing);
                        }}
                        className="button w-full py-2 flex items-center justify-center gap-2 text-sm"
                      >
                        <FiMessageCircle size={16} />
                        Message Seller
                      </button>
                    </div>
                  </div>
                  
                  {/* Seller Info */}
                  <div className="mb-4 p-3 border-2 border-foreground/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-sm">
                        {detailedListing.seller.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{detailedListing.seller}</p>
                        <div className="flex items-center text-xs text-foreground/70">
                          <span className="flex items-center">★ {detailedListing.rating}</span>
                          <span className="mx-1">•</span>
                          <span>{detailedListing.reviews} reviews</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/70">Member since January 2023</p>
                  </div>
                  
                  {/* Item Details */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-foreground/70">Category</p>
                      <p className="font-medium capitalize">{detailedListing.category}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-foreground/70">Location</p>
                      <p className="font-medium">{detailedListing.location}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-foreground/70">Listed</p>
                      <p className="font-medium">{detailedListing.listed}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="mt-6 border-t border-foreground/10 pt-6">
                <h3 className="text-lg font-bold mb-3">Description</h3>
                <p className="whitespace-pre-line text-foreground/90 text-sm">{detailedListing.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Favorites Modal */}
      {showFavorites && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background rounded-lg max-w-4xl w-full shadow-xl border-2 border-foreground/10 my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-foreground/10">
              <h2 className="text-2xl font-bold">Favorites</h2>
              <button 
                onClick={() => setShowFavorites(false)} 
                className="p-1 hover:bg-background-dark rounded-full"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {favorites.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map(item => (
                      <div 
                        key={item.id} 
                        className="bg-background-light border-2 border-foreground/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setDetailedListing(item);
                          setIsDetailModalOpen(true);
                          setShowFavorites(false);
                        }}
                      >
                        {/* Image placeholder */}
                        <div className="h-48 bg-foreground/5 flex items-center justify-center">
                          <span className="text-foreground/30">Item Image</span>
                        </div>

                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{item.title}</h3>
                            <button 
                              className="text-red-500"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering parent onClick
                                setFavorites(favorites.filter(fav => fav.id !== item.id));
                              }}
                            >
                              <FiHeart className="fill-current" />
                            </button>
                          </div>

                          <p className="text-lg font-mono font-bold mt-1">{item.price}</p>

                          <div className="flex items-center text-sm mt-1 text-foreground/70">
                            <span className="flex items-center">
                              ★ {item.rating}
                            </span>
                            <span className="mx-1">•</span>
                            <span>{item.reviews} reviews</span>
                          </div>

                          <p className="text-sm mt-1 text-foreground/70">
                            Seller: {item.seller}
                          </p>

                          <div className="flex flex-col mt-4">
                            <span className="text-xs text-foreground/50 mb-2">{item.listed}</span>
                            <div className="flex justify-between">
                              <button
                                className="button py-1 px-3 h-auto flex items-center gap-1 flex-1 mr-1 justify-center"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering parent onClick
                                  openChat(item);
                                  setShowFavorites(false);
                                }}
                              >
                                <FiMessageCircle size={14} />
                                <span>Chat</span>
                              </button>
                              <button 
                                className="button-primary py-1 px-3 h-auto flex items-center gap-1 flex-1 ml-1 justify-center"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering parent onClick
                                  openBuyModal(item);
                                  setShowFavorites(false);
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
                  
                  <div className="flex justify-end mt-6">
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all favorites?')) {
                          setFavorites([]);
                        }
                      }}
                      className="button text-red-500"
                    >
                      Clear All Favorites
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <FiHeart size={64} className="mx-auto mb-4 text-foreground/30" />
                  <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
                  <p className="text-foreground/70 mb-6">
                    Items you favorite will appear here for easy access
                  </p>
                  <button 
                    onClick={() => setShowFavorites(false)}
                    className="button-primary"
                  >
                    Browse Marketplace
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Create Listing Form Modal */}
      {(isCreateListingOpen || editingListing) && (
        <CreateListingForm
          onClose={() => {
            setIsCreateListingOpen(false);
            setEditingListing(null);
          }}
          onSuccess={(listingId) => {
            setIsCreateListingOpen(false);
            setEditingListing(null);
            // In a real app, you might refresh the listings or navigate to the new listing
            alert(`Listing ${editingListing ? 'updated' : 'created'} successfully! ID: ${listingId}`);
          }}
          initialData={editingListing ? {
            title: editingListing.title,
            description: editingListing.description,
            priceInCents: editingListing.price.replace('$', '').replace(',', ''),
            category: editingListing.category,
            country: editingListing.location.toLowerCase().slice(0, 2)
          } : undefined}
          listingId={editingListing ? editingListing.id.toString() : undefined}
          isEditing={!!editingListing}
        />
      )}
    </div>
  )
}