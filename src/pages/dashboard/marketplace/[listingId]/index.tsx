import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import MarketplaceLayout from '@/layouts/MarketplaceLayout'
import MarketListingModal from '@/components/marketplace/MarketListingModal'
import { PageWithLayout } from '@/data/types/layout'
import { QueryKeys } from '@/data/types/queries'
import { useApi } from '@/utils/frontend/api'
import { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { PaginatedResult } from '@/data/types/common'
import { queryMarketListingById } from '@/data/frontend/queries/queryMarketListingById'
import { useHoveringChatBox } from '@/hooks/useHoveringChatBox'
import { useEffect } from 'react'
import { deleteMarketListing } from '@/data/frontend/mutations/deleteMarketListing'

const MarketplaceListingPage: PageWithLayout = () => {
  const api = useApi()
  const router = useRouter()
  const listingId = router.query.listingId as string

  const hoveringChatBox = useHoveringChatBox({ api })

  useEffect(hoveringChatBox.hide, [])

  const queryClient = useQueryClient()
  const { data: listing } = useQuery({
    queryKey: [QueryKeys.MARKET_LISTINGS, listingId],
    queryFn: async () => {
      // check cache first
      const cache = queryClient
        .getQueryCache()
        .find<PaginatedResult<MarketListingSearchResult>>({
          queryKey: [QueryKeys.MARKET_LISTINGS],
        })?.state.data
      const cachedListing = cache?.data.find(
        (c) => c.id.toString() === listingId,
      )
      if (cachedListing) {
        return cachedListing
      }

      return await queryMarketListingById(api, listingId)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (listing: MarketListingSearchResult) => {
      if (!api.user) {
        throw new Error('User not logged in')
      }

      if (!confirm(`Are you sure you want to delete "${listing.title}"?`)) {
        return false
      }

      await deleteMarketListing(api, listing.id.toString())
      return listing
    },
    onSuccess: (listing: MarketListingSearchResult | false) => {
      if (!listing) {
        return
      }

      queryClient.invalidateQueries({ queryKey: [QueryKeys.MARKET_LISTINGS] })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.MARKET_LISTINGS, listing.id.toString()],
      })
      router.replace('/dashboard/marketplace')
    },
    onError: (error) => {
      console.error('Error deleting listing:', error)
    },
  })

  return (
    listing && (
      <MarketListingModal
        listing={listing}
        isMine={listing.author.id.toString() === api.user?.id}
        onChat={() => hoveringChatBox.show(listing)}
        onDeleteListing={() => deleteMutation.mutate(listing)}
        onClose={() => router.back()}
      />
    )
  )
}

MarketplaceListingPage.getLayout = (page) => {
  const GrandfatherLayout = MarketplaceLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<MarketplaceLayout>{page}</MarketplaceLayout>)
}

export default MarketplaceListingPage
