import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import type { ClientChat, ClientChatMessage } from '@/data/types/chats'
import { FiChevronLeft, FiMoreVertical, FiSend } from 'react-icons/fi'
import classNames from 'classnames'
import { useApi } from '@/utils/frontend/api'
import { QueryKeys } from '@/data/types/queries'
import { getChatMessages } from '@/data/frontend/queries/getChatMessages'
import { PaginatedResult } from '@/data/types/common'

export interface ChatThreadProps {
  className?: string
  chat: ClientChat
  currentUserId: string
  onMobileCloseClick?: () => void
}

const ChatThread: React.FC<ChatThreadProps> = ({
  className,
  chat,
  currentUserId,
  onMobileCloseClick,
}) => {
  const api = useApi()

  const { data: messages } = useQuery<PaginatedResult<ClientChatMessage>>({
    queryKey: [QueryKeys.CHAT_MESSAGES, chat.id],
    queryFn: async () => getChatMessages(api, chat.id),
    enabled: !!api.user,
  })

  const scrollHelperRef = useRef<HTMLDivElement>(null)

  const [messageInput, setMessageInput] = useState('')
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const otherParty = useCallback(
    (chat: ClientChat) =>
      chat.participants.find((participant) => participant.id !== currentUserId),
    [currentUserId],
  )

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim()) return

    // In a real app, you would send the message to an API
    console.log('Sending message:', messageInput)

    // Reset input
    setMessageInput('')
  }, [messageInput])

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      await handleSendMessage()
    },
    [handleSendMessage],
  )

  useEffect(() => {
    if (!messageInputRef.current) {
      console.error('messageInputRef is not set')
      return
    }
    const elem = messageInputRef.current

    const listener = (e: KeyboardEvent) => {
      console.log('keydown event fired')
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
        return false
      }
    }
    elem.addEventListener('keydown', listener)

    return () => {
      elem.removeEventListener('keydown', listener)
    }
  }, [messageInputRef, formRef, handleSendMessage])

  useLayoutEffect(() => {
    scrollHelperRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [chat, scrollHelperRef])

  useLayoutEffect(() => {
    messageInputRef.current?.focus()
  }, [messageInputRef])

  return (
    <section className={classNames('flex flex-col flex-nowrap', className)}>
      {/* Chat Header */}
      <div className='h-16 flex items-center justify-between px-4 border-b border-foreground/10'>
        <div className='flex items-center gap-3'>
          <button
            className='md:hidden text-foreground/70'
            onClick={onMobileCloseClick}
          >
            <FiChevronLeft size={20} />
          </button>
          <div className='w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground'>
            {otherParty(chat)?.username.charAt(0).toUpperCase()}
          </div>
          <h3 className='font-medium'>{otherParty(chat!)?.username}</h3>
        </div>
        <button className='text-foreground/70'>
          <FiMoreVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages?.data.map((message) => (
          <div
            key={message.id}
            className={classNames(
              'max-w-[80%] rounded-lg px-4 py-2 w-max',
              message.sender === 'me'
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-background-dark mr-auto',
            )}
          >
            <p>{message.content}</p>
            <p
              className={classNames(
                'text-xs mt-1',
                message.sender === currentUserId
                  ? 'text-white/70'
                  : 'text-foreground/50',
              )}
            >
              {dayjs(message.sentAt).fromNow()}
            </p>
          </div>
        ))}

        <div ref={scrollHelperRef} />
      </div>

      {/* Message Input */}
      <div className='p-4 border-t border-foreground/10'>
        <form
          ref={formRef}
          className='flex items-center gap-2'
          onSubmit={handleFormSubmit}
        >
          <TextareaAutosize
            ref={messageInputRef}
            name='message'
            className='flex-1 rounded-md border border-foreground/20 bg-background px-3 py-2 min-h-[2.5rem] max-h-[10rem] resize-none'
            placeholder='Type a message...'
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            minRows={1}
            maxRows={10}
            cacheMeasurements
          />
          <button
            type='submit'
            className='h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:opacity-50'
            disabled={!messageInput.trim()}
          >
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </section>
  )
}

export default ChatThread
