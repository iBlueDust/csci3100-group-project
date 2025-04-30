import { useRouter } from 'next/router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import MessagesLayout from '@/layouts/MessagesLayout'
import ChatBox from '@/components/ChatBox'
import { QueryKeys } from '@/data/types/queries'
import { queryChatById } from '@/data/frontend/queries/queryChatById'
import type { PageWithLayout } from '@/data/types/layout'
import { useApi } from '@/utils/frontend/api'
import { PaginatedResult } from '@/data/types/common'
import { ClientChat } from '@/data/types/chats'

const MessagesHome: PageWithLayout = () => {
  const api = useApi()
  const router = useRouter()
  const chatId = router.query.chatId as string

  const queryClient = useQueryClient()
  const { data: chat, isLoading } = useQuery({
    queryKey: [QueryKeys.CHATS, chatId],
    queryFn: async () => {
      // check cache first
      const cache = queryClient
        .getQueryCache()
        .find<PaginatedResult<ClientChat & { sharedKey: CryptoKey }>>({
          queryKey: [QueryKeys.CHATS],
        })?.state.data
      const cachedChat = cache?.data.find((c) => c.id === chatId)
      if (cachedChat) {
        return cachedChat
      }

      return await queryChatById(api, chatId)
    },
    enabled: !!chatId,
  })

  return isLoading || !chat ? (
    <div className='flex-1 flex items-center justify-center text-foreground/50'>
      <div className='text-center'>
        <p>Loading...</p>
      </div>
    </div>
  ) : (
    <ChatBox
      className='h-full'
      chat={chat}
      sharedKey={chat.sharedKey}
      onMobileCloseClick={() => {
        router.replace('/dashboard/messages')
      }}
    />
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
