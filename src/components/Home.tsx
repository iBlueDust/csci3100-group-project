import React from 'react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { QueryKeys } from '@/data/types/queries'
import { useApi } from '@/utils/frontend/api'
import { formatCurrency } from '@/utils/format'
import Link from 'next/link'

const LIMIT = 4

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HomeProps {}

const Home: React.FC<HomeProps> = ({}) => {
  const api = useApi()
  const { data: listings } = useQuery({
    queryKey: [QueryKeys.MARKET_LISTINGS],
    queryFn: () => queryMarketListings(api, { limit: LIMIT }),
  })

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-3xl font-bold mb-2'>Welcome back!</h2>
        <p className='text-foreground/70'>
          Here&apos;s what&apos;s happening on your Jade Trail today.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <div className='bg-background-light p-6 rounded-lg border border-foreground/10 shadow-sm'>
          <h3 className='text-xl font-bold mb-4'>Market Summary</h3>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Active Listings</span>
              <span className='font-mono font-bold'>
                {listings?.meta.total ?? '--'}
              </span>
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

        <div className='bg-background-light p-6 rounded-lg border border-foreground/10 shadow-sm'>
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

      <div className='bg-background-light p-6 rounded-lg border border-foreground/10 shadow-sm'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-bold'>Recent Listings</h3>
          <Link className='text-sm link' href='/dashboard/marketplace' replace>
            View All
          </Link>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='border-b border-foreground/10'>
              <tr className='[&>th]:py-3'>
                <th className='text-left'>Item</th>
                <th className='text-left'>Price</th>
                <th className='text-left'>Seller</th>
                <th className='text-left'>Listed</th>
                <th className='text-center'>Action</th>
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
    </div>
  )
}

export default Home
