import React, { useState } from 'react'
import CreateListingForm from './CreateListingForm'

const recentListings = [
  {
    id: 1,
    title: 'Collectible Item',
    price: '$250',
    seller: 'user123',
    time: '2 hours ago',
  },
  {
    id: 2,
    title: 'Rare Artifact',
    price: '$1,200',
    seller: 'jade_collector',
    time: '5 hours ago',
  },
  {
    id: 3,
    title: 'Vintage Item',
    price: '$800',
    seller: 'antique_lover',
    time: '1 day ago',
  },
  {
    id: 4,
    title: 'Limited Edition',
    price: '$450',
    seller: 'treasure_hunter',
    time: '2 days ago',
  },
]

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HomeProps {}

// Stats popup component
const StatsPopup: React.FC<{onClose: () => void}> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Market Statistics</h2>
          <button onClick={onClose} className="p-1 hover:bg-background-dark rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border-2 border-foreground/10 rounded-lg p-4">
            <h3 className="font-bold mb-3">Market Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Active Listings</span>
                <span className="font-mono font-bold">1,245</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Trades</span>
                <span className="font-mono font-bold">289</span>
              </div>
              <div className="flex justify-between">
                <span>Trade Volume (7d)</span>
                <span className="font-mono font-bold">$121,430</span>
              </div>
              <div className="flex justify-between">
                <span>New Accounts</span>
                <span className="font-mono font-bold">47</span>
              </div>
            </div>
          </div>
          
          <div className="border-2 border-foreground/10 rounded-lg p-4">
            <h3 className="font-bold mb-3">Top Categories</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Artifacts</span>
                <span className="font-mono font-bold">32%</span>
              </div>
              <div className="flex justify-between">
                <span>Collectibles</span>
                <span className="font-mono font-bold">28%</span>
              </div>
              <div className="flex justify-between">
                <span>Jewelry</span>
                <span className="font-mono font-bold">21%</span>
              </div>
              <div className="flex justify-between">
                <span>Others</span>
                <span className="font-mono font-bold">19%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-2 border-foreground/10 rounded-lg p-4">
          <h3 className="font-bold mb-3">Price History (30 Days)</h3>
          <div className="h-40 bg-background-dark/30 flex items-center justify-center">
            <p className="text-foreground/50">Graph visualization would appear here</p>
          </div>
        </div>
        
        <button onClick={onClose} className="button-primary w-full mt-6">
          Close
        </button>
      </div>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({}) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showStatsPopup, setShowStatsPopup] = useState(false)
  
  const handleCreateSuccess = (listingId: string) => {
    setShowCreateForm(false)
    // In a real app, you might want to refresh the listings or show a success message
    console.log(`Listing created with ID: ${listingId}`)
  }
  
  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-3xl font-bold mb-2'>Welcome back!</h2>
        <p className='text-foreground/70'>
          Here&apos;s what&apos;s happening on your Jade Trail today.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        {/* Market Summary Card */}
        <div className='bg-background-light p-6 rounded-lg border-2 border-foreground/10 shadow-sm'>
          <h3 className='text-xl font-bold mb-4'>Market Summary</h3>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Active Listings</span>
              <span className='font-mono font-bold'>1,245</span>
            </div>
            <div className='flex justify-between'>
              <span>Completed Trades</span>
              <span className='font-mono font-bold'>289</span>
            </div>
            <div className='flex justify-between'>
              <span>Average Trade Value</span>
              <span className='font-mono font-bold'>$420</span>
            </div>
          </div>
          <button 
            className='mt-4 button w-full'
            onClick={() => setShowStatsPopup(true)}
          >
            View More Stats
          </button>
        </div>

        <div className='bg-background-light p-6 rounded-lg border-2 border-foreground/10 shadow-sm'>
          <h3 className='text-xl font-bold mb-4'>Your Activity</h3>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Current Listings</span>
              <span className='font-mono font-bold'>3</span>
            </div>
            <div className='flex justify-between'>
              <span>Pending Trades</span>
              <span className='font-mono font-bold'>1</span>
            </div>
            <div className='flex justify-between'>
              <span>Messages</span>
              <span className='font-mono font-bold'>5</span>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className='mt-4 button-primary w-full'
          >
            Create New Listing
          </button>
        </div>
      </div>

      <div className='bg-background-light p-6 rounded-lg border-2 border-foreground/10 shadow-sm'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-bold'>Recent Listings</h3>
          <button className='text-sm link'>View All</button>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead className='border-b-2 border-foreground/10'>
              <tr>
                <th className='py-3 text-left'>Item</th>
                <th className='py-3 text-left'>Price</th>
                <th className='py-3 text-left'>Seller</th>
                <th className='py-3 text-left'>Listed</th>
                <th className='py-3 text-right'>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentListings.map((item) => (
                <tr
                  key={item.id}
                  className='border-b border-foreground/5 hover:bg-background-dark/30'
                >
                  <td className='py-3'>{item.title}</td>
                  <td className='py-3 font-mono'>{item.price}</td>
                  <td className='py-3'>{item.seller}</td>
                  <td className='py-3 text-foreground/70'>{item.time}</td>
                  <td className='py-3 text-right'>
                    <button className='button py-1 px-3 h-auto'>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Create Listing Form Modal */}
      {showCreateForm && (
        <CreateListingForm 
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      
      {/* Stats Pop-up Modal */}
      {showStatsPopup && (
        <StatsPopup onClose={() => setShowStatsPopup(false)} />
      )}
    </div>
  )
}

export default Home
