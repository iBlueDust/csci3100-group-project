import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { useQuery } from '@tanstack/react-query'
import { FiPlus, FiSearch } from 'react-icons/fi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import type { PageWithLayout } from '@/data/types/layout'
import type { ClientChat } from '@/data/types/chats'
import { QueryKeys } from '@/data/types/queries'
import { queryChats } from '@/data/frontend/queries/queryChats'
import { useApi } from '@/utils/frontend/api'
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
  // const { isMobile } = useDevice({
  //   mobileThreshold: 768, // equivalent to Tailwind CSS 'md' breakpoint
  // })

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')

  // Create conversation modal state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)

  // Pagination state for conversations
  const [currentPage, setCurrentPage] = useState(1)
  const [conversationsPerPage /* , setConversationsPerPage */] = useState(10)

  // Separate effect to handle active conversation changes for message content search
  useEffect(() => {
    if (!searchQuery.trim()) {
      return
    }

    // // Re-run the search when active conversation changes, but don't reset the page
    // const filtered = mockConversations.filter(conversation => {
    //   const userMatch = conversation.user.toLowerCase().includes(searchQuery.toLowerCase());
    //   const messageMatch = conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    //   // Also search in message content if the conversation is active
    //   let messageContentMatch = false;
    //   if (Number(activeConversation) === conversation.id) {
    //     const messagesForConversation = mockMessages[conversation.id as keyof typeof mockMessages];
    //     if (messagesForConversation) {
    //       messageContentMatch = messagesForConversation.some(msg =>
    //         msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    //       );
    //     }
    //   }
    //   return userMatch || messageMatch || messageContentMatch;
    // });
    // setFilteredConversations(filtered);
    // Notice: we don't reset page number here
  }, [searchQuery])

  const { data: chats } = useQuery({
    queryKey: [QueryKeys.CHATS],
    queryFn: () => queryChats(api),
    enabled: !!api.user && !!api.uek,
    throwOnError: isDev,
    staleTime: 5 * 1000,
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

  // Handle search
  const handleSearch = useCallback(() => {
    // The search is already handled by the useEffect above
    // This function is mainly for the search button click
    console.log('Searching for:', searchQuery)
  }, [searchQuery])

  // Handle creating a new conversation
  const handleNewChat = useCallback((recipient: string) => {
    setIsNewChatModalOpen(false)
    if (!recipient.trim()) {
      return
    }

    // In a real app, you would make an API call to create a new conversation with this user
    console.log('Creating new conversation with:', recipient)
  }, [])

  return (
    <div className='h-screen md:h-[calc(100vh-7rem)] flex flex-col overflow-hidden'>
      <h1 className='text-3xl font-bold mb-4 md:block hidden'>Messages</h1>

      <div className='flex flex-1 md:border-2 border-0 md:border-foreground/10 rounded-lg overflow-hidden md:mt-0 mt-[-16px]'>
        {/* Conversation List */}
        <div
          className={classNames(
            'flex flex-col flex-nowrap md:w-1/3 md:border-r-2 border-foreground/10 h-full bg-background-light md:relative md:z-20 fixed inset-x-0 md:top-0 top-16 md:bottom-0 bottom-14 z-[5] overflow-hidden md:overflow-auto',
            mobileChatVisible && 'hidden md:flex',
          )}
        >
          {/* Header + search container */}
          <div className='sticky top-0 bg-background-light z-10'>
            {/* Header with height matching chat header in desktop view */}
            <div className='h-12 md:h-16 flex items-center md:px-4 px-2 border-b border-foreground/25 justify-between'>
              <h3 className='text-lg font-bold'>Conversations</h3>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className='px-4 py-2 rounded-md bg-background border border-foreground-light/25 text-foreground items-center gap-2 text-sm font-medium hover:bg-background-dark transition-colors shadow-sm md:flex hidden'
              >
                <FiPlus />
                <span>New</span>
              </button>
            </div>

            {/* Adjusted padding for mobile */}
            <div className='md:px-4 px-2 py-2 border-b border-foreground-light/25 bg-background-light'>
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

              {/* Mobile New Chat button below search */}
              <div className='md:hidden mt-2'>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className='w-full py-2 rounded-md bg-foreground text-background flex items-center justify-center gap-2 text-sm font-medium hover:bg-foreground/80 transition-colors shadow-sm'
                >
                  <span>New Chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conversation items list - Make sure this is scrollable in all views */}
          <div className='flex-1 overflow-y-auto pointer-events-auto'>
            {chats?.data.map((chat) => (
              <div
                key={chat.id}
                onClick={() => router.replace(`/dashboard/messages/${chat.id}`)}
                className={classNames(
                  'md:p-4 p-2 border-b-2 border-foreground/5 hover:bg-background-dark/10 cursor-pointer',
                  activeChatId === chat.id && 'bg-background-dark/20',
                )}
              >
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 flex-shrink-0 rounded-full bg-foreground/10 flex items-center justify-center text-foreground'>
                    {otherParty(chat)?.username.charAt(0).toUpperCase() ?? '–'}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-baseline'>
                      <h4 className='font-medium truncate'>
                        {otherParty(chat)?.username}
                      </h4>
                      <span className='text-xs text-foreground/70'>
                        {chat.lastMessage?.sentAt
                          ? dayjs(chat.lastMessage.sentAt).fromNow()
                          : ''}
                      </span>
                    </div>
                    {chat.lastMessage && (
                      <p className='text-sm text-foreground/70 truncate'>
                        {chat.lastMessage.content.toString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className='h-12 min-h-12 flex items-center justify-center border-t border-foreground/25 sticky bottom-0 bg-background-light z-10'>
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
          onCancel={() => setIsNewChatModalOpen(false)}
          onConfirm={handleNewChat}
        />
      )}
    </div>
  )
}

MessagesLayout.PageLayout = function MessagesLayout({ children }) {
  const GrandfatherLayout =
    DashboardLayout.PageLayout ?? (({ children }) => children)
  return (
    <GrandfatherLayout>
      <DashboardLayout>{children}</DashboardLayout>
    </GrandfatherLayout>
  )
}

export default MessagesLayout
