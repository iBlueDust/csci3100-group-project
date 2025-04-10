import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiGrid, FiList, FiChevronDown, FiHeart, FiShoppingCart, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// Mock categories
const categories = [
  { id: 'all', name: 'All Items' },
  { id: 'jade', name: 'Jade Items' },
  { id: 'antiques', name: 'Antiques' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'art', name: 'Artwork' },
  { id: 'gems', name: 'Precious Gems' }
]

// Mock marketplace listings
const mockListings = [
  {
    id: 1,
    title: 'Ancient Jade Pendant',
    description: 'Beautiful hand-carved jade pendant from the Ming Dynasty era. Certified authentic.',
    price: '$850',
    seller: 'jade_master',
    rating: 4.8,
    reviews: 32,
    image: '', // In a real app, you'd add image URLs
    category: 'jade',
    location: 'Hong Kong',
    listed: '3 days ago'
  },
  {
    id: 2,
    title: 'Vintage Porcelain Vase',
    description: 'Elegant blue and white porcelain vase from the Qing Dynasty. Excellent condition.',
    price: '$1,200',
    seller: 'antique_collector',
    rating: 4.9,
    reviews: 45,
    image: '',
    category: 'antiques',
    location: 'Beijing',
    listed: '1 week ago'
  },
  {
    id: 3,
    title: 'Emerald Bracelet',
    description: 'Stunning emerald bracelet with silver setting. Professionally appraised.',
    price: '$950',
    seller: 'gem_trader',
    rating: 4.7,
    reviews: 18,
    image: '',
    category: 'gems',
    location: 'Shanghai',
    listed: '2 days ago'
  },
  {
    id: 4,
    title: 'Bronze Buddha Statue',
    description: 'Detailed bronze Buddha statue with gold leaf accents. Ming Dynasty style.',
    price: '$750',
    seller: 'history_buff',
    rating: 4.6,
    reviews: 12,
    image: '',
    category: 'antiques',
    location: 'Taiwan',
    listed: '5 days ago'
  },
  {
    id: 5,
    title: 'Jade Elephant Figurine',
    description: 'Hand-carved jade elephant with intricate details. Symbol of good fortune.',
    price: '$420',
    seller: 'jade_enthusiast',
    rating: 4.9,
    reviews: 27,
    image: '',
    category: 'jade',
    location: 'Singapore',
    listed: '1 day ago'
  },
  {
    id: 6,
    title: 'Calligraphy Scroll',
    description: 'Beautiful handwritten calligraphy on traditional rice paper. Signed by the artist.',
    price: '$350',
    seller: 'art_collector',
    rating: 4.8,
    reviews: 15,
    image: '',
    category: 'art',
    location: 'Hong Kong',
    listed: '4 days ago'
  },
  {
    id: 7,
    title: 'Sapphire Pendant',
    description: 'Elegant sapphire pendant with diamond accents. Great for special occasions.',
    price: '$1,100',
    seller: 'gem_specialist',
    rating: 5.0,
    reviews: 22,
    image: '',
    category: 'gems',
    location: 'Macau',
    listed: '3 days ago'
  },
  {
    id: 8,
    title: 'Coin Collection',
    description: 'Rare collection of ancient Chinese coins from various dynasties. Great investment.',
    price: '$2,200',
    seller: 'numismatist',
    rating: 4.9,
    reviews: 31,
    image: '',
    category: 'collectibles',
    location: 'Beijing',
    listed: '1 week ago'
  }
]

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filter and sort listings
  const filteredListings = mockListings
    .filter(listing => {
      // Search filter
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           listing.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
      
      // Price filter
      const matchesMinPrice = !minPrice || parseFloat(listing.price.substring(1).replace(',', '')) >= parseFloat(minPrice);
      const matchesMaxPrice = !maxPrice || parseFloat(listing.price.substring(1).replace(',', '')) <= parseFloat(maxPrice);
      
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
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

  // Calculate total pages
  useEffect(() => {
    setTotalPages(Math.ceil(filteredListings.length / itemsPerPage));
  }, [filteredListings, itemsPerPage]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredListings.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Marketplace</h2>
        <p className="text-foreground/70">Browse, buy, and trade with trusted sellers on The Jade Trail</p>
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
              className="w-full px-4 py-2 pl-10 border border-foreground/10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FiSearch className="absolute left-3 top-3 text-foreground/50" />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="h-full px-4 py-2 border border-foreground/10 rounded-md appearance-none pr-8 bg-background"
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
          <div className="mt-4 p-4 border border-foreground/10 rounded-md">
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
                <h4 className="font-medium mb-2">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 border border-foreground/10 rounded-md"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 border border-foreground/10 rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
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
      <p className="mb-4 text-foreground/70">
        Showing {filteredListings.length} {filteredListings.length === 1 ? 'result' : 'results'}
      </p>

      {/* Item grid/list */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map(item => (
            <div 
              key={item.id} 
              className="bg-background-light border border-foreground/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image placeholder */}
              <div className="h-48 bg-foreground/5 flex items-center justify-center">
                <span className="text-foreground/30">Item Image</span>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{item.title}</h3>
                  <button className="text-foreground/50 hover:text-red-500">
                    <FiHeart />
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
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-foreground/50">{item.listed}</span>
                  <button className="button-primary py-1 px-3 h-auto flex items-center gap-1">
                    <FiShoppingCart size={14} />
                    <span>Buy</span>
                  </button>
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
              className="bg-background-light border border-foreground/10 rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow"
            >
              {/* Image placeholder */}
              <div className="h-24 w-24 bg-foreground/5 flex items-center justify-center shrink-0">
                <span className="text-foreground/30">Image</span>
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
                
                <div className="flex justify-end mt-2 gap-2">
                  <button className="button py-1 px-3 h-auto">
                    Message
                  </button>
                  <button className="button-primary py-1 px-3 h-auto flex items-center gap-1">
                    <FiShoppingCart size={14} />
                    <span>Buy</span>
                  </button>
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
          <div className="flex border border-foreground/10 rounded-md overflow-hidden">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className={`px-4 py-2 border-r border-foreground/10 flex items-center ${
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
              className={`px-4 py-2 border-l border-foreground/10 flex items-center ${
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
            className="px-2 py-1 border border-foreground/10 rounded-md"
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
    </div>
  )
}