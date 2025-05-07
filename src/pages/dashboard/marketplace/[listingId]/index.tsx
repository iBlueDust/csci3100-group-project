import { useQuery, useQueryClient } from '@tanstack/react-query'
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

  return (
    listing && (
      <MarketListingModal
        listing={listing}
        isMine={listing.author.id.toString() === api.user?.id}
        onChat={() => hoveringChatBox.show(listing)}
        onClose={() => router.push('/dashboard/marketplace')}
      />
    )
  )
}

MarketplaceListingPage.getLayout = (page) => {
  const GrandfatherLayout = MarketplaceLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<MarketplaceLayout>{page}</MarketplaceLayout>)
}

export default MarketplaceListingPage
