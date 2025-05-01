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

MarketplaceCreateListingPage.PageLayout =
  function MarketplaceCreateListingLayout({ children }) {
    const GrandfatherLayout =
      MarketplaceLayout.PageLayout ?? (({ children }) => children)
    return (
      <GrandfatherLayout>
        <MarketplaceLayout>{children}</MarketplaceLayout>
      </GrandfatherLayout>
    )
  }

export default MarketplaceCreateListingPage
