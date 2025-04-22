import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import type { PageWithLayout } from '@/data/types/layout'
import type { ClientChat } from '@/data/types/chats'
import { ApiProvider, useApi } from '@/utils/frontend/api'
import { QueryKeys } from '@/data/types/queries'
import { isDev } from '@/utils/frontend/env'
import { queryChats } from '@/data/frontend/queries/queryChats'
import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi'

const ChatThread = dynamic(() => import('@/components/ChatThread'), {
  ssr: false,
})

const Messages: PageWithLayout = () => {
  const api = useApi()
  const router = useRouter()

  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [mobileChatVisible, setMobileChatVisible] = useState(false)

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')

  // Create conversation modal state
  const [isCreateConversationOpen, setIsCreateConversationOpen] =
    useState(false)
  const [newConversationUsername, setNewConversationUsername] = useState('')

  // Pagination state for conversations
  const [currentPage, setCurrentPage] = useState(1)
  const [conversationsPerPage /* , setConversationsPerPage */] = useState(10)

  // Separate effect to handle active conversation changes for message content search
  useEffect(() => {
    if (searchQuery.trim() && activeChatId) {
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
    }
  }, [activeChatId, searchQuery])

  const openConversation = (id: string) => {
    setActiveChatId(id)
    setMobileChatVisible(true)
  }

  // Handle search
  const handleSearch = () => {
    // The search is already handled by the useEffect above
    // This function is mainly for the search button click
    console.log('Searching for:', searchQuery)
  }

  // Handle creating a new conversation
  const handleCreateConversation = () => {
    if (newConversationUsername.trim()) {
      // In a real app, you would make an API call to create a new conversation with this user
      console.log('Creating new conversation with:', newConversationUsername)

      // // For demo purposes, we'll mock creating a new conversation by adding it to the list
      // const newConversation = {
      //   id: mockConversations.length + 1,
      //   user: newConversationUsername,
      //   avatar: '', // No avatar initially
      //   lastMessage: "New conversation",
      //   unread: false,
      //   time: 'Just now',
      // };

      // // Add the new conversation to the beginning of the list
      // setFilteredConversations([newConversation, ...filteredConversations]);

      // // Open the new conversation
      // setActiveConversation(String(newConversation.id));
      // setMobileChatVisible(true);

      // // Reset the form and close the modal
      // setNewConversationUsername('');
      // setIsCreateConversationOpen(false);
    }
  }

  // Handle delete chat
  const handleDeleteChat = () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this conversation? This action cannot be undone.',
      )
    ) {
      return
    }

    // In a real app, we would make an API call to delete the chat
    // For this mock, we'll just close the active conversation
    // setActiveConversation(null)
    setMobileChatVisible(false)

    // In a real implementation, we would also need to remove the conversation from the list
    // For now, we'll just leave it in the list since we're using mock data
    console.log(`Deleted conversation: ${activeChatId}`)
  }

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

  const activeChat = useMemo(() => {
    if (!activeChatId) return null
    return chats?.data.find((chat) => chat.id === activeChatId)
  }, [activeChatId, chats])

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

  // For demo purposes - toggle deletion status
  useLayoutEffect(() => {
    if (!api.user) {
      router.replace('/')
      return
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='h-screen md:h-[calc(100vh-7rem)] flex flex-col overflow-hidden'>
      <h1 className='text-3xl font-bold mb-4 md:block hidden'>Messages</h1>

      <div className='flex flex-1 md:border-2 border-0 md:border-foreground/10 rounded-lg overflow-hidden md:mt-0 mt-[-16px]'>
        {/* Conversation List */}
        <div
          className={classNames(
            'md:w-1/3 md:border-r-2 border-foreground/10 h-full bg-background-light md:relative md:z-20 fixed inset-x-0 md:top-0 top-16 md:bottom-0 bottom-14 z-[5] overflow-hidden md:overflow-auto',
            mobileChatVisible && 'hidden md:flex md:flex-col md:flex-nowrap',
          )}
        >
          {/* Header + search container */}
          <div className='sticky top-0 bg-background-light z-10'>
            {/* Header with height matching chat header in desktop view */}
            <div className='h-12 md:h-16 flex items-center md:px-4 px-2 border-b-2 border-foreground/10 justify-between'>
              <h3 className='text-lg font-bold'>Conversations</h3>
              <button
                onClick={() => setIsCreateConversationOpen(true)}
                className='px-5 py-2 rounded-md bg-foreground text-background items-center gap-2 text-sm font-medium hover:bg-foreground/80 transition-colors shadow-sm md:flex hidden'
              >
                <span>New Chat</span>
              </button>
            </div>
            {/* Adjusted padding for mobile */}
            <div className='md:px-4 px-2 py-2 border-b-2 border-foreground/10 bg-background-light'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search messages...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className='w-full px-4 py-2 pr-12 border-2 border-foreground/10 rounded-md text-black outline-none focus:outline-none focus:border-foreground/10'
                />
                <button
                  onClick={handleSearch}
                  className='absolute right-0 top-0 h-full px-4 rounded-r-md bg-foreground text-background flex items-center justify-center'
                  aria-label='Search'
                >
                  <FiSearch />
                </button>
              </div>
              {/* Mobile New Chat button below search */}
              <div className='md:hidden mt-2'>
                <button
                  onClick={() => setIsCreateConversationOpen(true)}
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
                onClick={() => openConversation(String(chat.id))}
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
          <div className='h-12 min-h-[3rem] flex items-center justify-center border-t-2 border-foreground/10 sticky bottom-0 bg-background-light z-10'>
            <div className='flex items-center'>
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 ${
                  currentPage === 1
                    ? 'text-foreground/30 cursor-not-allowed'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                <FiChevronLeft />
              </button>

              <span className='mx-2 text-sm'>
                {chats
                  ? `${indexOfFirstConversation + 1}-${Math.min(
                      indexOfLastConversation,
                      chats.meta.total,
                    )} of ${chats.meta.total}`
                  : '-- of --'}
              </span>

              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 ${
                  currentPage === totalPages
                    ? 'text-foreground/30 cursor-not-allowed'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`w-full md:w-2/3 flex flex-col ${
            !mobileChatVisible ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeChat ? (
            <ChatThread
              className='h-full'
              chat={activeChat}
              sharedKey={activeChat.sharedKey}
              onMobileCloseClick={() => {
                setActiveChatId(null)
                setMobileChatVisible(false)
              }}
              onDeleteChat={handleDeleteChat}
            />
          ) : (
            <div className='flex-1 flex items-center justify-center text-foreground/50'>
              <div className='text-center'>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Conversation Modal */}
      {isCreateConversationOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background border-2 border-foreground/10 rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-xl font-bold mb-4'>Start a New Conversation</h3>

            <div className='mb-6'>
              <label
                htmlFor='username'
                className='block text-sm font-medium mb-2'
              >
                Username
              </label>
              <input
                type='text'
                id='username'
                placeholder='Enter username'
                value={newConversationUsername}
                onChange={(e) => setNewConversationUsername(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleCreateConversation()
                }
                className='w-full px-4 py-2 pr-12 border-2 border-foreground/10 rounded-md text-black outline-none focus:outline-none focus:border-foreground/10'
              />
            </div>

            <div className='flex justify-end gap-2'>
              <button
                onClick={() => setIsCreateConversationOpen(false)}
                className='px-4 py-2 border-2 border-foreground/10 rounded-md hover:bg-foreground/5'
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConversation}
                className='px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90'
                disabled={!newConversationUsername.trim()}
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

Messages.PageLayout = function MessagesLayout({ children }) {
  return <ApiProvider>{children}</ApiProvider>
}

export default Messages
