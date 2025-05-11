import React, { useMemo } from 'react'
import { FiChevronLeft, FiTrash2 } from 'react-icons/fi'
import classNames from 'classnames'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { ClientChat } from '@/data/types/chats'
import BasicSpinner from '@/components/BasicSpinner'
import ChatThread from '@/components/chat/ChatThread'
import { useApi } from '@/utils/frontend/api'
import { useChatMessages } from '@/hooks/useChatMessages'

export interface ChatBoxProps {
  className?: string
  chat: ClientChat
  sharedKey: CryptoKey
  isDeleting?: boolean
  onMobileCloseClick?: () => void
  onDeleteChat?: () => void
}

const ChatBox: React.FC<ChatBoxProps> = ({
  className,
  chat,
  sharedKey,
  isDeleting = false,
  onMobileCloseClick,
  onDeleteChat,
}) => {
  const api = useApi()
  const { messages, sendMessage } = useChatMessages(api, chat.id, sharedKey)

  const otherParty = useMemo(
    () =>
      chat.participants.find((participant) => participant.id !== api.user?.id),
    [chat, api],
  )

  return (
    <section className={classNames('flex flex-col flex-nowrap', className)}>
      {/* Chat Header */}
      <div className='flex h-16 min-h-16 items-center justify-between border-b border-foreground/10 px-4'>
        <div className='flex items-center gap-3'>
          <button
            className='text-foreground/70 md:hidden'
            onClick={onMobileCloseClick}
          >
            <FiChevronLeft size={20} />
          </button>
          <div className='flex size-8 items-center justify-center rounded-full bg-foreground/10 text-foreground'>
            {otherParty?.username.charAt(0).toUpperCase()}
          </div>
          <h3
            className='line-clamp-1 flex-1 font-medium'
            title={otherParty?.username}
          >
            {otherParty?.username}
          </h3>
        </div>

        <button
          className='flex size-10 items-center justify-center rounded-full bg-foreground/10 transition-colors hover:bg-foreground/20 hover:text-red-500'
          onClick={onDeleteChat}
          disabled={isDeleting}
        >
          {!isDeleting ? (
            <FiTrash2 size={16} />
          ) : (
            <BasicSpinner className='size-4' />
          )}
        </button>
      </div>

      <ChatThread
        messages={messages.data ?? []}
        sharedKey={sharedKey}
        wasRequestedToDelete={chat.wasRequestedToDelete}
        onSend={sendMessage}
        onDeleteChat={onDeleteChat}
      />
      {/* </div> */}
    </section>
  )
}

export default ChatBox
