import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import MarketplaceLayout from '@/layouts/MarketplaceLayout'
import { PageWithLayout } from '@/types/layout'

const MarketplaceHome: PageWithLayout = () => {
  return ''
}

MarketplaceHome.getLayout = (page) => {
  const GrandfatherLayout = MarketplaceLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<MarketplaceLayout>{page}</MarketplaceLayout>)
}

export default MarketplaceHome
