import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Image from 'next/image'
import { FiChevronLeft, FiPaperclip, FiSend, FiTrash2 } from 'react-icons/fi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import {
  ChatMessageType,
  type ClientChat,
  type ClientChatMessage,
} from '@/data/types/chats'
import classNames from 'classnames'
import { useApi } from '@/utils/frontend/api'
import { QueryKeys } from '@/data/types/queries'
import { PaginatedResult } from '@/data/types/common'
import { PostChatMessagePayload } from '@/data/frontend/fetches/postChatMessage'
import { isDev } from '@/utils/frontend/env'
import { queryChatMessages } from '@/data/frontend/queries/queryChatMessages'
import { sendChatMessage } from '@/data/frontend/mutations/sendChatMessage'
import ChatRecipientLeftBanner from './ChatRecipientLeftBanner'

export interface ChatThreadProps {
  className?: string
  chat: ClientChat
  sharedKey: CryptoKey
  onMobileCloseClick?: () => void
  onDeleteChat?: () => void
}

const ChatThread: React.FC<ChatThreadProps> = ({
  className,
  chat,
  sharedKey,
  onMobileCloseClick,
  onDeleteChat,
}) => {
  const api = useApi()
  const queryClient = useQueryClient()

  const otherParty = useMemo(
    () =>
      chat.participants.find((participant) => participant.id !== api.user?.id),
    [chat, api],
  )

  const { data: messages } = useQuery<PaginatedResult<ClientChatMessage>>({
    queryKey: [QueryKeys.CHAT_MESSAGES, chat.id],
    queryFn: async () => queryChatMessages(api, chat.id, sharedKey),
    throwOnError: isDev,
    enabled: !!api.user && !!sharedKey,
  })

  const mutation = useMutation({
    mutationFn: async (arg: PostChatMessagePayload<string>) =>
      sendChatMessage(api, chat.id, arg, sharedKey),
    onSuccess: () => {
      // Reload chat messages
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CHAT_MESSAGES, chat.id],
      })
    },
  })

  const scrollHelperRef = useRef<HTMLDivElement>(null)

  const [messageInput, setMessageInput] = useState('')
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  const [attachment, setAttachment] = useState<File | null>(null)
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false)
  const attachmentInputRef = useRef<HTMLInputElement>(null)

  const formRef = useRef<HTMLFormElement>(null)

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAttachment(file)
      setShowAttachmentPreview(true)
    }
  }

  const cancelAttachment = () => {
    setAttachment(null)
    setShowAttachmentPreview(false)
  }

  const handleSendMessage = useCallback(async () => {
    const messageInput = messageInputRef.current?.value || ''
    const attachment = attachmentInputRef.current?.files?.[0] || null
    if (!messageInput.trim() || !attachment) {
      console.warn('Message input is empty')
      return
    }

    if (!api.user) {
      console.warn('User is not yet authenticated')
      return
    }

    // In a real app, you would send the message to an API
    const message: PostChatMessagePayload<string> = {
      type: ChatMessageType.Text,
      content: messageInput,
    }

    try {
      await mutation.mutateAsync(message)
    } catch (error) {
      console.error('Error sending message:', error)
    }

    // Reset input
    setMessageInput('')
    setAttachment(null)
    setShowAttachmentPreview(false)
  }, [api, mutation])

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

      {/* Container for mobile that includes both the banner and messages with a single scroll */}
      <div className='fixed inset-0 top-16 bottom-[4rem] overflow-y-auto md:static md:flex-1 md:overflow-y-auto bg-background'>
        {/* Deletion banner */}
        {chat.wasRequestedToDelete && (
          <ChatRecipientLeftBanner onDelete={onDeleteChat} />
        )}

        {/* Messages */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {messages?.data.map((message) => (
            <div
              key={message.id}
              className={classNames(
                'max-w-[80%] rounded-lg px-4 py-2 w-max',
                message.sender === api.user?.id
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-background-dark mr-auto',
              )}
            >
              {message.type === ChatMessageType.Text ? (
                <p>{message.content}</p>
              ) : message.type === ChatMessageType.Attachment ? (
                /\.(jpe?g|png|gif|webp)$/i.test(message.content.toString()) ? (
                  <Image
                    width={100}
                    height={100}
                    src={message.content.toString()}
                    alt={message.contentFilename}
                    className='max-w-full h-auto rounded-lg'
                  />
                ) : (
                  <a
                    href={message.content.toString()}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 hover:bg-foreground/10 p-2 rounded-lg transition-colors'
                  >
                    <div className='bg-foreground/5 p-2 rounded-lg'>
                      <FiPaperclip size={18} />
                    </div>
                    <div className='overflow-hidden'>
                      <p className='truncate'>{message.content}</p>
                      <p className='text-xs text-foreground/70'>
                        Click to open
                      </p>
                    </div>
                  </a>
                )
              ) : null}
              <p
                className={classNames(
                  'text-xs mt-1',
                  message.sender === api.user?.id
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
      </div>

      {/* Message Input - Fixed at bottom for mobile */}
      <div className='fixed bottom-0 left-0 right-0 p-2 md:p-4 border-t-2 border-foreground/10 bg-background z-20 md:relative md:bottom-0'>
        {/* Attachment preview */}
        {showAttachmentPreview && attachment && (
          <div className='mb-2 p-2 border-2 border-foreground/10 rounded-lg bg-background-dark/10 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='bg-foreground/5 p-2 rounded-lg'>
                <FiPaperclip size={18} />
              </div>
              <div>
                <p className='text-sm truncate'>{attachment.name}</p>
                <p className='text-xs text-foreground/70'>
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={cancelAttachment}
              className='text-foreground/70 hover:text-red-500 transition-colors'
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        )}

        <div className='flex items-center gap-2'>
          <form
            ref={formRef}
            className='flex w-full items-center gap-2'
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
            <label className='h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center cursor-pointer hover:bg-foreground/20 transition-colors'>
              <FiPaperclip size={18} />
              <input
                type='file'
                onChange={handleAttachmentChange}
                className='hidden'
              />
            </label>
            <button
              type='submit'
              className='h-10 w-10 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center disabled:opacity-50 border-2 border-gray-200 dark:border-gray-700'
              disabled={!messageInput.trim() && !attachment}
            >
              <FiSend size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ChatThread
