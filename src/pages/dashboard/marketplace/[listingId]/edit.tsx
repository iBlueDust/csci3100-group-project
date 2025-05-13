import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import MarketplaceLayout from '@/layouts/MarketplaceLayout'
import EditMarketListingModal from '@/components/marketplace/EditMarketListingModal'
import { PageWithLayout } from '@/types/layout'
import { QueryKeys } from '@/types/queries'
import { useApi } from '@/hooks/useApi'
import { MarketListingSearchResult } from '@/data/api/mongo/queries/market'
import { PaginatedResult } from '@/types/common'
import { queryMarketListingById } from '@/data/frontend/queries/queryMarketListingById'

const MarketplaceEditListingPage: PageWithLayout = () => {
  const api = useApi()
  const router = useRouter()
  const listingId = router.query.listingId as string

  const queryClient = useQueryClient()

  const { data: listing } = useQuery({
    queryKey: [QueryKeys.MARKET_LISTINGS, listingId],
    initialData: queryClient.getQueryData<MarketListingSearchResult>([
      QueryKeys.MARKET_LISTINGS,
      listingId,
    ]),
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

  const handleSuccess = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.MARKET_LISTINGS],
    })
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.MARKET_LISTINGS, listingId],
    })
    router.back()
  }, [router, queryClient, listingId])

  return (
    listing && (
      <EditMarketListingModal
        listingId={listing.id.toString()}
        initialData={listing}
        onSuccess={handleSuccess}
        onClose={() => router.back()}
      />
    )
  )
}

MarketplaceEditListingPage.getLayout = (page) => {
  const GrandfatherLayout = MarketplaceLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<MarketplaceLayout>{page}</MarketplaceLayout>)
}

export default MarketplaceEditListingPage
