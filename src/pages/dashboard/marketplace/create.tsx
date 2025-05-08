import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import MarketplaceLayout from '@/layouts/MarketplaceLayout'
import NewMarketListingModal from '@/components/marketplace/NewMarketListingModal'
import { PageWithLayout } from '@/data/types/layout'
import { QueryKeys } from '@/data/types/queries'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

const MarketplaceCreateListingPage: PageWithLayout = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSuccess = useCallback(
    (listingId: string) => {
      router.push(`/dashboard/marketplace/${listingId}`)
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.MARKET_LISTINGS],
      })
    },
    [queryClient, router],
  )

  const handleClose = useCallback(() => {
    router.push('/dashboard/marketplace')
  }, [router])

  return (
    <NewMarketListingModal onClose={handleClose} onSuccess={handleSuccess} />
  )
}

MarketplaceCreateListingPage.getLayout = (page) => {
  const GrandfatherLayout = MarketplaceLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<MarketplaceLayout>{page}</MarketplaceLayout>)
}

export default MarketplaceCreateListingPage
