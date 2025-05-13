import React, { useState, useMemo } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import DashboardLayout from '@/layouts/DashboardLayout'
import NewMarketListingModal from '@/components/marketplace/NewMarketListingModal'
import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { mockListings } from '@/data/mock/listings'
import { useApi } from '@/hooks/useApi'
import { formatCurrency, formatNumber } from '@/utils/format'
import { PageWithLayout } from '@/types/layout'
import { QueryKeys } from '@/types/queries'

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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm'>
      <div className='mx-4 max-h-[80vh] w-full max-w-screen-sm overflow-y-auto rounded-lg bg-background p-6 md:mx-auto md:max-w-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>Market Statistics</h2>
          <button
            onClick={onClose}
            className='rounded-full p-1 hover:bg-background-dark'
          >
            <FiX size={24} className='text-foreground' />
          </button>
        </div>

        <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='rounded-lg border-2 border-foreground/10 p-4'>
            <h3 className='mb-3 font-bold'>Market Activity</h3>
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

          <div className='rounded-lg border-2 border-foreground/10 p-4'>
            <h3 className='mb-3 font-bold'>Top Categories</h3>
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

        <button onClick={onClose} className='button-primary mt-6 w-full'>
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
        <h2 className='mb-2 text-3xl font-bold'>Welcome back!</h2>
        <p className='text-foreground/70'>
          Here&apos;s what&apos;s happening on your Jade Trail today.
        </p>
      </div>

      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Market Summary Card */}
        <section className='rounded-lg border-2 border-foreground/10 bg-background-light p-6 shadow-sm'>
          <h3 className='mb-4 text-xl font-bold'>Market Summary</h3>
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
            className='button mt-4 w-full'
            onClick={() => setShowStatsPopup(true)}
          >
            View More Stats
          </button>
        </section>

        <section className='rounded-lg border-2 border-foreground/10 bg-background-light p-6 shadow-sm'>
          <h3 className='mb-4 text-xl font-bold'>Your Activity</h3>
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
            className='button-primary mt-4 flex w-full items-center justify-center gap-2'
            href='/dashboard/marketplace/create'
          >
            <FiPlus /> Create New Listing
          </Link>
        </section>
      </div>

      <section className='rounded-lg border-2 border-foreground/10 bg-background-light p-6 shadow-sm'>
        <div className='mb-4'>
          <h3 className='text-xl font-bold'>Recent Listings</h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead className='border-b-2 border-foreground/10 [&_th:first-child]:pl-0 [&_th:last-child]:pr-0 [&_th]:px-2'>
              <tr>
                <th className='py-3 text-left'>Item</th>
                <th className='py-3 text-left'>Price</th>
                <th className='py-3 text-left'>Seller</th>
                <th className='py-3 text-left'>Listed</th>
              </tr>
            </thead>
            <tbody className='[&_td:first-child]:pl-0 [&_td:last-child]:pr-0 [&_td]:px-2'>
              {listings?.data.slice(0, LIMIT).map((listing) => (
                <tr
                  key={listing.id.toString()}
                  className='border-b border-foreground/5 hover:bg-background-dark/30 [&>td]:py-2'
                >
                  <td>
                    <p className='line-clamp-1 max-w-max'>{listing.title}</p>
                    <p className='line-clamp-1 max-w-max text-sm text-foreground-light/75'>
                      {listing.description.split('\n')[0]}
                    </p>
                  </td>
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
                    <Link
                      className='button mx-auto h-auto'
                      href={`/dashboard/marketplace/${listing.id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
