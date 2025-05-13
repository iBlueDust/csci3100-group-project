import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import type { PageWithLayout } from '@/types/layout'
import MessagesLayout from '@/layouts/MessagesLayout'

const MessagesHome: PageWithLayout = () => {
  return (
    <div className='flex flex-1 items-center justify-center text-foreground/50'>
      <div className='text-center'>
        <p>Select a conversation to start messaging</p>
      </div>
    </div>
  )
}

MessagesHome.getLayout = (page) => {
  const GrandfatherLayout = MessagesLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<MessagesLayout>{page}</MessagesLayout>)
}

export default MessagesHome
