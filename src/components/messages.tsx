import { useCallback, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import type { PageWithLayout } from '@/data/types/layout'
import type { ClientChat } from '@/data/types/chats'
import { ApiProvider, useApi } from '@/utils/frontend/api'
import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/data/types/queries'
import { getChats } from '@/data/frontend/queries/getChats'

const ChatThread = dynamic(() => import('@/components/ChatThread'), {
  ssr: false,
})

// Mock data for conversations
// const mockConversations = [
//   {
//     id: 1,
//     user: 'jade_collector',
//     avatar: '',
//     lastMessage: "I'm interested in your jade pendant",
//     unread: true,
//     time: '2h ago',
//   },
//   {
//     id: 2,
//     user: 'antique_lover',
//     avatar: '',
//     lastMessage: 'Is the price negotiable?',
//     unread: false,
//     time: '1d ago',
//   },
//   {
//     id: 3,
//     user: 'treasure_hunter',
//     avatar: '',
//     lastMessage: 'Thanks for the quick delivery!',
//     unread: false,
//     time: '3d ago',
//   },
//   {
//     id: 4,
//     user: 'gem_specialist',
//     avatar: '',
//     lastMessage: 'Do you have any more items like this?',
//     unread: true,
//     time: '1w ago',
//   },
// ]

const Messages: PageWithLayout = () => {
  const api = useApi()

  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [mobileChatVisible, setMobileChatVisible] = useState(false)

  const { data: chats } = useQuery({
    queryKey: [QueryKeys.CHATS],
    queryFn: () => getChats(api),
    enabled: !!api.user,
  })

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

  const openConversation = (id: string) => {
    setActiveChatId(id)
    setMobileChatVisible(true)
  }

  return (
    <div className='h-[calc(100vh-7rem)] flex flex-col'>
      <h2 className='text-3xl font-bold mb-4'>Messages</h2>

      <div className='flex flex-1 border border-foreground/10 rounded-lg overflow-hidden'>
        {/* Conversation List - hidden on mobile when a chat is open */}
        <div
          className={`w-full md:w-1/3 border-r border-foreground/10 bg-background-light ${
            mobileChatVisible ? 'hidden md:block' : 'block'
          }`}
        >
          <div className='h-16 flex items-center px-4 border-b border-foreground/10'>
            <h3 className='text-lg font-bold'>Conversations</h3>
          </div>

          <div className='overflow-y-auto h-[calc(100%-4rem)]'>
            {chats?.data.map((chat) => (
              <div
                key={chat.id}
                onClick={() => openConversation(chat.id)}
                className={`p-4 border-b border-foreground/5 cursor-pointer hover:bg-background-dark/30 transition-colors ${
                  activeChatId === chat.id ? 'bg-background-dark/50' : ''
                }`}
              >
                <div className='flex items-center gap-3'>
                  {!chat.wasRequestedToDelete ? (
                    <div className='w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground'>
                      {(otherParty(chat)?.username ?? '--')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  ) : (
                    <div className='w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500'>
                      !
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-baseline'>
                      <h4 className='font-medium truncate'>
                        {otherParty(chat)?.username ?? '--'}
                      </h4>
                      <span className='text-xs text-foreground/70'>
                        {chat.lastMessage?.sentAt
                          ? dayjs(chat.lastMessage.sentAt).fromNow()
                          : ''}
                      </span>
                    </div>
                    <p className={'text-sm truncate text-foreground/70'}>
                      {chat.lastMessage?.content ?? ''}
                    </p>
                  </div>
                  {/* {chat.unread && (
                    <div className='w-2 h-2 rounded-full bg-blue-500'></div>
                  )} */}
                </div>
              </div>
            ))}
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
              currentUserId={api.user?.id ?? ''}
              onMobileCloseClick={() => {
                setActiveChatId(null)
                setMobileChatVisible(false)
              }}
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
    </div>
  )
}

Messages.PageLayout = function MessagesLayout({ children }) {
  return <ApiProvider>{children}</ApiProvider>
}

export default Messages
