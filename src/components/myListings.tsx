import { useState, useEffect } from 'react'
import { FiEdit, FiTrash2, FiEye, FiShoppingCart, FiList, FiGrid, FiChevronDown, FiAlertCircle, FiPlus } from 'react-icons/fi'
import { mockListings, mockUserListings } from '@/data/mock/listings'
import CreateListingForm from './CreateListingForm'

interface MyListingsProps {
  navigateToMarketplace?: (listingId: number) => void
}

export default function MyListings({ navigateToMarketplace }: MyListingsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState('newest')
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false)
  const [editingListing, setEditingListing] = useState<typeof mockListings[0] | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [listingToDelete, setListingToDelete] = useState<typeof mockListings[0] | null>(null)

  // Filter listings to only show the user's own listings (mock implementation)
  // In a real app, you would fetch these from an API
  const myListings = mockUserListings

  // Sort user listings
  const sortedListings = [...myListings].sort((a, b) => {
    if (sortOption === 'newest') {
      return a.id < b.id ? 1 : -1; // Using ID as a proxy for newest for this mock
    } else if (sortOption === 'price_low') {
      return parseFloat(a.price.substring(1).replace(',', '')) - parseFloat(b.price.substring(1).replace(',', ''));
    } else if (sortOption === 'price_high') {
      return parseFloat(b.price.substring(1).replace(',', '')) - parseFloat(a.price.substring(1).replace(',', ''));
    } else if (sortOption === 'rating') {
      return b.rating - a.rating;
    } else if (sortOption === 'oldest') {
      return a.id > b.id ? 1 : -1;
    }
    return 0;
  });

  // Function to handle viewing a listing in the marketplace
  const viewListingInMarketplace = (listingId: number) => {
    if (navigateToMarketplace) {
      navigateToMarketplace(listingId);
    }
  }

  // Handle deletion of a listing
  const confirmDelete = () => {
    // In a real app, you would call an API to delete the listing
    // For now, we'll just close the modal
    setIsDeleteModalOpen(false);
    setListingToDelete(null);
    // Show success message
    alert('Listing deleted successfully!');
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2">My Listings</h2>
          <p className="text-foreground/70">Manage your items for sale on The Jade Trail</p>
        </div>
        <button 
          className="button-primary h-auto py-2 px-5"
          onClick={() => setIsCreateListingOpen(true)}
        >
          <div className="flex items-center gap-2">
            <FiPlus />
            <span>Create New Listing</span>
          </div>
        </button>
      </div>

      {/* Filters and sorting */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="text-foreground/70">
            Showing {myListings.length} {myListings.length === 1 ? 'listing' : 'listings'}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="h-full px-4 py-2 border-2 border-foreground/10 rounded-md appearance-none pr-8 bg-background"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
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
          </div>
        </div>
      </div>

      {/* Empty state */}
      {myListings.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-foreground/10 rounded-lg">
          <FiShoppingCart size={48} className="mb-4 text-foreground/30" />
          <h3 className="text-xl font-bold mb-2">No Listings Yet</h3>
          <p className="text-foreground/70 mb-6 max-w-md">
            You haven't created any listings yet. Create your first listing to start selling on The Jade Trail!
          </p>
          <button 
            onClick={() => setIsCreateListingOpen(true)}
            className="button-primary"
          >
            <div className="flex items-center gap-2">
              <FiPlus />
              <span>Create Your First Listing</span>
            </div>
          </button>
        </div>
      )}

      {/* Grid View */}
      {myListings.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedListings.map(listing => (
            <div 
              key={listing.id} 
              className="bg-background-light border-2 border-foreground/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Item image */}
              <div className="h-48 bg-foreground/5 overflow-hidden">
                {listing.image ? (
                  <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-foreground/30">Item Image</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-medium mb-1">{listing.title}</h3>
                <p className="text-lg font-mono font-bold">{listing.price}</p>

                <div className="flex items-center text-sm mt-1 text-foreground/70">
                  <span className="flex items-center">
                    ★ {listing.rating}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{listing.reviews} reviews</span>
                </div>

                <div className="text-xs text-foreground/50 mt-2">
                  Listed: {listing.listed}
                </div>

                <div className="flex mt-4 gap-2">
                  <button
                    className="button py-1 px-2 flex items-center gap-1 flex-1"
                    onClick={() => viewListingInMarketplace(listing.id)}
                  >
                    <FiEye size={14} />
                    <span>View</span>
                  </button>
                  <button 
                    className="button py-1 px-2 flex items-center gap-1 flex-1"
                    onClick={() => setEditingListing(listing)}
                  >
                    <FiEdit size={14} />
                    <span>Edit</span>
                  </button>
                  <button 
                    className="button py-1 px-2 flex items-center gap-1 flex-1 text-red-500"
                    onClick={() => {
                      setListingToDelete(listing);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <FiTrash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {myListings.length > 0 && viewMode === 'list' && (
        <div className="space-y-4">
          {sortedListings.map(listing => (
            <div 
              key={listing.id} 
              className="bg-background-light border-2 border-foreground/10 rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow"
            >
              {/* Item image */}
              <div className="h-24 w-24 bg-foreground/5 shrink-0 overflow-hidden">
                {listing.image ? (
                  <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-foreground/30">Image</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{listing.title}</h3>
                  <p className="text-lg font-mono font-bold">{listing.price}</p>
                </div>

                <p className="text-sm mt-1 line-clamp-2 text-foreground/70">
                  {listing.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  <span className="text-sm flex items-center text-foreground/70">
                    ★ {listing.rating} ({listing.reviews} reviews)
                  </span>

                  <span className="text-sm text-foreground/70">
                    Location: {listing.location}
                  </span>

                  <span className="text-sm text-foreground/70">
                    Listed: {listing.listed}
                  </span>
                </div>

                <div className="flex mt-3 gap-2">
                  <button
                    className="button py-1 px-3 h-auto flex items-center gap-1"
                    onClick={() => viewListingInMarketplace(listing.id)}
                  >
                    <FiEye size={14} />
                    <span>View in Marketplace</span>
                  </button>
                  <button 
                    className="button py-1 px-3 h-auto flex items-center gap-1"
                    onClick={() => setEditingListing(listing)}
                  >
                    <FiEdit size={14} />
                    <span>Edit Listing</span>
                  </button>
                  <button 
                    className="button py-1 px-3 h-auto flex items-center gap-1 text-red-500"
                    onClick={() => {
                      setListingToDelete(listing);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <FiTrash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Listing Form Modal */}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && listingToDelete && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full shadow-xl border-2 border-foreground/10">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <FiAlertCircle size={24} />
              <h2 className="text-xl font-bold">Delete Listing</h2>
            </div>
            
            <p className="mb-4">
              Are you sure you want to delete "<span className="font-medium">{listingToDelete.title}</span>"? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="button px-4"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="button bg-red-500 text-white px-4 hover:bg-red-600"
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
