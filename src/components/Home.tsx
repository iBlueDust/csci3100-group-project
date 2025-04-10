import React from 'react'

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

const Home: React.FC<HomeProps> = ({}) => {
  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-3xl font-bold mb-2'>Welcome back!</h2>
        <p className='text-foreground/70'>
          Here&apos;s what&apos;s happening on your Jade Trail today.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
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
          <button className='mt-4 button w-full'>View More Stats</button>
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
          <button className='mt-4 button-primary w-full'>
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
    </div>
  )
}

export default Home
