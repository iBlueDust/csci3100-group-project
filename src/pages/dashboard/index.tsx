import React, { useState, useMemo } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { QueryKeys } from '@/data/types/queries'
import { mockListings } from '@/data/mock/listings'
import { useApi } from '@/utils/frontend/api'
import { formatCurrency, formatNumber } from '@/utils/format'
import NewMarketListingModal from '../../components/marketplace/NewMarketListingModal'
import { PageWithLayout } from '@/data/types/layout'
import DashboardLayout from '@/layouts/DashboardLayout'
import Link from 'next/link'

// Get recent listings (first 4)
// const recentListings = getRecentListings(4)

// Calculate market statistics
const calculateMarketStats = () => {
  const totalListings = mockListings.length

  // Calculate completed trades (just a mock example - approximately 30% of listings)
  const completedTrades = Math.floor(totalListings * 0.3)

  // Calculate average price
  const totalValue = mockListings.reduce((sum, item) => {
    return sum + parseFloat(item.price.replace('$', '').replace(',', ''))
  }, 0)

  const averagePrice = Math.round(totalValue / totalListings)
  const tradeVolume = Math.round(totalValue * 0.3) // Assuming 30% of items were traded

  // Calculate category distribution
  const categories: Record<string, number> = {}
  mockListings.forEach((item) => {
    if (categories[item.category]) {
      categories[item.category]++
    } else {
      categories[item.category] = 1
    }
  })

  const categoryPercentages: Record<string, number> = {}
  Object.keys(categories).forEach((cat) => {
    categoryPercentages[cat] = Math.round(
      (categories[cat] / totalListings) * 100,
    )
  })

  // Get top categories
  const topCategories = Object.entries(categoryPercentages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  // Approximate new accounts - just a mock example
  const newAccounts = Math.floor(totalListings * 0.1)

  return {
    totalListings,
    completedTrades,
    averagePrice,
    tradeVolume,
    topCategories,
    newAccounts,
  }
}

const LIMIT = 4

export interface HomeProps {
  navigateToMarketplace?: (listingId: number) => void
}

// Stats popup component
const StatsPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const stats = calculateMarketStats()

  return (
    <div className='fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-background rounded-lg p-6 w-full max-w-screen-sm md:max-w-2xl max-h-[80vh] overflow-y-auto mx-4 md:mx-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold'>Market Statistics</h2>
          <button
            onClick={onClose}
            className='p-1 hover:bg-background-dark rounded-full'
          >
            <FiX size={24} className='text-foreground' />
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div className='border-2 border-foreground/10 rounded-lg p-4'>
            <h3 className='font-bold mb-3'>Market Activity</h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span>Active Listings</span>
                <span className='font-mono font-bold'>
                  {formatNumber(stats.totalListings)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Completed Trades</span>
                <span className='font-mono font-bold'>
                  {formatNumber(stats.completedTrades)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Trade Volume (7d)</span>
                <span className='font-mono font-bold'>
                  {formatCurrency(stats.tradeVolume)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>New Accounts</span>
                <span className='font-mono font-bold'>
                  {formatNumber(stats.newAccounts)}
                </span>
              </div>
            </div>
          </div>

          <div className='border-2 border-foreground/10 rounded-lg p-4'>
            <h3 className='font-bold mb-3'>Top Categories</h3>
            <div className='space-y-3'>
              {stats.topCategories.map(([category, percentage], index) => (
                <div key={index} className='flex justify-between'>
                  <span className='capitalize'>{category}</span>
                  <span className='font-mono font-bold'>{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={onClose} className='button-primary w-full mt-6'>
          Close
        </button>
      </div>
    </div>
  )
}

const Home: PageWithLayout<HomeProps> = ({
  navigateToMarketplace,
}: HomeProps) => {
  const api = useApi()
  const { data: listings } = useQuery({
    queryKey: [QueryKeys.MARKET_LISTINGS],
    queryFn: () => queryMarketListings(api, { limit: LIMIT }),
  })

  const [showStatsPopup, setShowStatsPopup] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Handle successful listing creation
  const handleCreateSuccess = (listingId: string) => {
    setShowCreateForm(false)
    if (navigateToMarketplace) {
      navigateToMarketplace(Number(listingId))
    }
  }

  return (
    <div className='pb-16'>
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
            {/* Using useMemo to avoid recalculating on every render */}
            {useMemo(() => {
              const stats = calculateMarketStats()
              return (
                <>
                  <div className='flex justify-between'>
                    <span>Active Listings</span>
                    <span className='font-mono font-bold'>
                      {listings?.meta.total}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Completed Trades</span>
                    <span className='font-mono font-bold'>
                      {stats.completedTrades}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Average Trade Value</span>
                    <span className='font-mono font-bold'>
                      ${stats.averagePrice}
                    </span>
                  </div>
                </>
              )
            }, [listings])}
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
          <Link
            className='mt-4 button-primary w-full flex items-center justify-center gap-2'
            href='/dashboard/marketplace/create'
          >
            <FiPlus /> Create New Listing
          </Link>
        </div>
      </div>

      <div className='bg-background-light p-6 rounded-lg border-2 border-foreground/10 shadow-sm'>
        <div className='mb-4'>
          <h3 className='text-xl font-bold'>Recent Listings</h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead className='border-b-2 border-foreground/10'>
              <tr>
                <th className='py-3 text-left'>Item</th>
                <th className='py-3 text-left'>Price</th>
                <th className='py-3 text-left'>Seller</th>
                <th className='py-3 text-left'>Listed</th>
              </tr>
            </thead>
            <tbody>
              {listings?.data.slice(0, LIMIT).map((listing) => (
                <tr
                  key={listing.id.toString()}
                  className='border-b border-foreground/5 hover:bg-background-dark/30 [&>td]:py-3'
                >
                  <td>{listing.title}</td>
                  <td className='font-mono'>
                    {formatCurrency(listing.priceInCents)}
                  </td>
                  <td>
                    {listing.author.username ?? listing.author.id.toString()}
                  </td>
                  <td className='text-foreground/70'>
                    {dayjs(listing.listedAt).fromNow()}
                  </td>
                  <td className='text-right'>
                    <button className='button py-1 mx-auto px-3 h-auto'>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Listing Form Modal */}
      {showCreateForm && (
        <NewMarketListingModal
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

Home.getLayout = (page) => {
  const GrandfatherLayout = DashboardLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<DashboardLayout>{page}</DashboardLayout>)
}

export default Home
