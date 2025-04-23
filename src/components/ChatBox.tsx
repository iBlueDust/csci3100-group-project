import React, { useMemo } from 'react'
import { FiChevronLeft, FiTrash2 } from 'react-icons/fi'
import classNames from 'classnames'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { type ClientChat } from '@/data/types/chats'
import { useApi } from '@/utils/frontend/api'
import ChatThreadContent from './ChatThread'

export interface ChatThreadProps {
  className?: string
  chat: ClientChat
  sharedKey: CryptoKey
  onMobileCloseClick?: () => void
  onDeleteChat?: () => void
}

const ChatBox: React.FC<ChatThreadProps> = ({
  className,
  chat,
  sharedKey,
  onMobileCloseClick,
  onDeleteChat,
}) => {
  const api = useApi()

  const otherParty = useMemo(
    () =>
      chat.participants.find((participant) => participant.id !== api.user?.id),
    [chat, api],
  )

  return (
    <section className={classNames('flex flex-col flex-nowrap', className)}>
      {/* Chat Header */}
      <div className='min-h-16 h-16 flex items-center justify-between px-4 border-b border-foreground/10'>
        <div className='flex items-center gap-3'>
          <button
            className='md:hidden text-foreground/70'
            onClick={onMobileCloseClick}
          >
            <FiChevronLeft size={20} />
          </button>
          <div className='w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground'>
            {otherParty?.username.charAt(0).toUpperCase()}
          </div>
          <h3 className='font-medium'>{otherParty?.username}</h3>
        </div>
        <button
          className='h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 hover:text-red-500 transition-colors'
          onClick={onDeleteChat}
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      {/* <div className='relative flex-1 bg-red-500 overflow-y-auto'>
        <div className='flex flex-col min-h-full flex-nowrap'>
          <div className='bg-green-200 h-24 sticky top-0'></div>

          <div className='space-y-4 p-4 mt-auto'>
            <div className='w-50 h-16 bg-blue-300' />
            <div className='w-50 h-16 bg-blue-300' />
            <div className='w-50 h-16 bg-blue-300' />
            <div className='w-50 h-16 bg-blue-300' />
            <div className='w-50 h-16 bg-blue-300' />
            <div className='w-50 h-16 bg-blue-300' />
            <div className='w-50 h-16 bg-blue-300' />
            <div className='w-50 h-16 bg-blue-300' />
          </div>

          <div className='bg-gray-500 h-24 sticky flex bottom-0'></div>
        </div> */}

      <ChatThreadContent
        chat={chat}
        sharedKey={sharedKey}
        onDeleteChat={onDeleteChat}
      />
      {/* </div> */}
    </section>
  )
}

export default ChatBox
