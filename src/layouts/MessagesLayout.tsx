import { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Link from 'next/link'
import classNames from 'classnames'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FiFile, FiPlus } from 'react-icons/fi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import type { PageWithLayout } from '@/types/layout'
import { ChatMessageType, type ClientChat } from '@/types/chats'
import { QueryKeys } from '@/types/queries'
import { queryChats } from '@/data/frontend/queries/queryChats'
import { useApi } from '@/hooks/useApi'
import { isDev } from '@/utils/frontend/env'
import DashboardLayout from '@/layouts/DashboardLayout'
import MiniPaginationControls from '@/components/MiniPaginationControls'
// import { useDevice } from '@/hooks/useDevice'

const NewChatModal = dynamic(() => import('@/components/chat/NewChatModal'))

export interface MessagesLayoutProps {
  children?: React.ReactNode
}

const MessagesLayout: PageWithLayout<MessagesLayoutProps> = ({ children }) => {
  const api = useApi()
  const router = useRouter()

  const activeChatId = router.query.chatId
    ? (router.query.chatId as string)
    : undefined
  const mobileChatVisible = !!activeChatId

  // Create conversation modal state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const openNewChatModal = useCallback(() => setIsNewChatModalOpen(true), [])
  const closeNewChatModal = useCallback(() => setIsNewChatModalOpen(false), [])

  // Pagination state for conversations
  const [currentPage, setCurrentPage] = useState(1)
  const [conversationsPerPage /* , setConversationsPerPage */] = useState(10)

  const { data: chats } = useQuery({
    queryKey: [QueryKeys.CHATS],
    queryFn: () => queryChats(api),
    enabled: !!api.user && !!api.uek,
    throwOnError: isDev,
    staleTime: 5 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  })

  // Calculate total pages
  const totalPages = chats
    ? Math.ceil(chats.meta.total / conversationsPerPage)
    : undefined

  // Get current page conversations
  const indexOfLastConversation = currentPage * conversationsPerPage
  const indexOfFirstConversation =
    indexOfLastConversation - conversationsPerPage

  const otherParty = useCallback(
    (chat: ClientChat) => {
      if (!api.user) return null

      const otherParticipant = chat.participants.find(
        (participant) => participant.id !== api.user!.id,
      )
      return otherParticipant
    },
    [api],
  )

  // Change page
  const changePage = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1
    if (totalPages != null && pageNumber > totalPages) pageNumber = totalPages
    setCurrentPage(pageNumber)
  }

  const queryClient = useQueryClient()
  const handleNewChatSuccess = useCallback(() => {
    closeNewChatModal()
    queryClient.invalidateQueries({ queryKey: [QueryKeys.CHATS] })
  }, [closeNewChatModal, queryClient])

  return (
    <div className='flex h-screen flex-col overflow-hidden md:h-[calc(100vh-7rem)]'>
      <h1 className='mb-4 hidden text-3xl font-bold md:block'>Messages</h1>

      <div className='mt-[-16px] flex flex-1 overflow-hidden rounded-lg border-0 md:mt-0 md:border-2 md:border-foreground/10'>
        {/* Conversation List */}
        <div
          className={classNames(
            'flex flex-col flex-nowrap md:w-1/3 md:border-r-2 border-foreground/10 h-full bg-background-light md:relative md:z-20 fixed inset-x-0 md:top-0 top-16 md:bottom-0 bottom-14 z-[5] overflow-hidden md:overflow-auto',
            mobileChatVisible && 'hidden md:flex',
          )}
        >
          {/* Header + search container */}
          <div className='sticky top-0 z-10 bg-background-light'>
            {/* Header with height matching chat header in desktop view */}
            <div className='flex h-12 items-center justify-between border-b border-foreground/25 px-2 md:h-16 md:px-4'>
              <h3 className='text-lg font-bold'>Conversations</h3>
              <button
                onClick={openNewChatModal}
                className='hidden items-center gap-2 rounded-md border border-foreground-light/25 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-background-dark md:flex'
              >
                <FiPlus />
                <span>New</span>
              </button>
            </div>

            {/* Adjusted padding for mobile */}
            {/* <div className='md:px-4 px-2 py-2 border-b border-foreground-light/25 bg-background-light'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search chats'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className='w-full px-4 py-2 pr-12 border border-foreground/25 rounded-md text-foreground outline-none focus:outline-none focus:border-foreground/10 bg-background hover:bg-background-dark'
                />
                <button
                  onClick={handleSearch}
                  className='absolute right-0 top-0 h-full px-4 rounded-r-md bg-background hover:bg-background-dark border border-foreground-light/25 text-foreground flex items-center justify-center'
                  aria-label='Search'
                >
                  <FiSearch />
                </button>
              </div>

              {\/* Mobile New Chat button below search *\/}
              <div className='md:hidden mt-2'>
                <button
                  onClick={openNewChatModal}
                  className='w-full py-2 rounded-md bg-foreground text-background flex items-center justify-center gap-2 text-sm font-medium hover:bg-foreground/80 transition-colors shadow-sm'
                >
                  <span>New Chat</span>
                </button>
              </div>
            </div> */}
          </div>

          {/* Conversation items list - Make sure this is scrollable in all views */}
          <div className='pointer-events-auto flex-1 overflow-y-auto'>
            {chats?.data.map((chat) => (
              <Link
                key={chat.id}
                href={`/dashboard/messages/${chat.id}`}
                replace
                className={classNames(
                  'md:p-4 p-2 block border-b-2 border-foreground/5 hover:bg-background-dark/10 cursor-pointer',
                  activeChatId === chat.id && 'bg-background-dark/20',
                )}
              >
                <div className='flex items-center gap-3'>
                  <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground'>
                    {otherParty(chat)?.username.charAt(0).toUpperCase() ?? '–'}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-baseline justify-between'>
                      <h4 className='truncate font-medium'>
                        {otherParty(chat)?.username}
                      </h4>
                      <span className='text-xs text-foreground/70'>
                        {chat.lastMessage?.sentAt
                          ? dayjs(chat.lastMessage.sentAt).fromNow()
                          : ''}
                      </span>
                    </div>
                    {chat.lastMessage && (
                      <p className='truncate text-sm text-foreground/70'>
                        {chat.lastMessage.type === ChatMessageType.Text &&
                          chat.lastMessage.content.toString()}

                        {chat.lastMessage.type ===
                          ChatMessageType.MarketListing && (
                          <>
                            <FiFile className='mr-1 inline-block' size={14} />
                            <span className='h-full align-middle'>
                              {'sent a market listing'}
                            </span>
                          </>
                        )}

                        {chat.lastMessage.type ===
                          ChatMessageType.Attachment && (
                          <>
                            <FiFile className='mr-1 inline-block' size={14} />
                            <span className='h-full align-middle'>
                              {chat.lastMessage.contentFilename ??
                                'sent an attachment'}
                            </span>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination controls */}
          <div className='sticky bottom-0 z-10 flex h-12 min-h-12 items-center justify-center border-t border-foreground/25 bg-background-light'>
            <MiniPaginationControls
              indexOfFirstItem={indexOfFirstConversation}
              indexOfLastItem={indexOfLastConversation}
              numberOfItems={chats?.meta.total}
              onPrevClick={() => changePage(currentPage - 1)}
              onNextClick={() => changePage(currentPage + 1)}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={classNames(
            'w-full md:w-2/3 flex flex-col',
            !mobileChatVisible ? 'hidden md:flex' : 'flex',
          )}
        >
          {children}
        </div>
      </div>

      {/* Create Conversation Modal */}
      {isNewChatModalOpen && (
        <NewChatModal
          onCancel={closeNewChatModal}
          onConfirm={handleNewChatSuccess}
        />
      )}
    </div>
  )
}

MessagesLayout.getLayout = (page) => {
  const GrandfatherLayout = DashboardLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<DashboardLayout>{page}</DashboardLayout>)
}

export default MessagesLayout
