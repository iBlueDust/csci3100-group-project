import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import MarketplaceLayout from '@/layouts/MarketplaceLayout'
import { PageWithLayout } from '@/data/types/layout'

const MarketplaceHome: PageWithLayout = () => {
  return ''
}

MarketplaceHome.PageLayout = function MarketplaceHomeLayout({ children }) {
  const GrandfatherLayout =
    MarketplaceLayout.PageLayout ?? (({ children }) => children)
  return (
    <GrandfatherLayout>
      <MarketplaceLayout>{children}</MarketplaceLayout>
    </GrandfatherLayout>
  )
}

export default MarketplaceHome
