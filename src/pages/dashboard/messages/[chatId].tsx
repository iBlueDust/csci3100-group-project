import { useCallback, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import MessagesLayout from '@/layouts/MessagesLayout'
import ChatBox from '@/components/chat/ChatBox'
import { QueryKeys } from '@/types/queries'
import { queryChatById } from '@/data/frontend/queries/queryChatById'
import type { PageWithLayout } from '@/types/layout'
import { PaginatedResult } from '@/types/common'
import { ClientChat } from '@/types/chats'
import { useApi } from '@/hooks/useApi'
import { deleteChat } from '@/data/frontend/mutations/deleteChat'

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

  // Handle delete chat
  const [isDeleting, setIsDeleting] = useState(false)
  const handleDeleteChat = useCallback(async () => {
    if (!chatId) return
    if (
      !window.confirm(
        'Are you sure you want to delete this conversation? This action cannot be undone.',
      )
    )
      return

    setIsDeleting(true)

    try {
      const success = await deleteChat(api, chatId)
      if (!success) {
        throw new Error('Failed to delete chat')
      }
    } catch (error) {
      console.error('Failed to delete chat', error)
      alert('Failed to delete chat')
      return
    } finally {
      setIsDeleting(false)
    }

    router.replace('/dashboard/messages')
    queryClient.invalidateQueries({ queryKey: [QueryKeys.CHATS] })
    queryClient.invalidateQueries({ queryKey: [QueryKeys.CHATS, chatId] })
    console.log(`Deleted conversation: ${chatId}`)
  }, [api, chatId, router, queryClient])

  return isLoading || !chat ? (
    <div className='flex flex-1 items-center justify-center text-foreground/50'>
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
      isDeleting={isDeleting}
      onDeleteChat={handleDeleteChat}
    />
  )
}

MessagesHome.getLayout = (page) => {
  const GrandfatherLayout = MessagesLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<MessagesLayout>{page}</MessagesLayout>)
}

export default MessagesHome
