import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import type { PageWithLayout } from '@/data/types/layout'
import MessagesLayout from '@/layouts/MessagesLayout'

const MessagesHome: PageWithLayout = () => {
  return (
    <div className='flex-1 flex items-center justify-center text-foreground/50'>
      <div className='text-center'>
        <p>Select a conversation to start messaging</p>
      </div>
    </div>
  )
}

MessagesHome.PageLayout = function MessagesHomeLayout({ children }) {
  const GrandfatherLayout =
    MessagesLayout.PageLayout ?? (({ children }) => children)
  return (
    <GrandfatherLayout>
      <MessagesLayout>{children}</MessagesLayout>
    </GrandfatherLayout>
  )
}

export default MessagesHome
