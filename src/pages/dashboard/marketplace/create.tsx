import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import MarketplaceLayout from '@/layouts/MarketplaceLayout'
import CreateListingForm from '@/components/marketplace/CreateListingForm'
import { PageWithLayout } from '@/data/types/layout'

const MarketplaceCreateListingPage: PageWithLayout = () => {
  const router = useRouter()

  return (
    <CreateListingForm
      onClose={() => router.push('/dashboard/marketplace')}
      onSuccess={(listingId) =>
        router.push(`/dashboard/marketplace/${listingId}`)
      }
    />
  )
}

MarketplaceCreateListingPage.getLayout = (page) => {
  const GrandfatherLayout = MarketplaceLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<MarketplaceLayout>{page}</MarketplaceLayout>)
}

export default MarketplaceCreateListingPage
