import React, { useCallback, useMemo } from 'react'
import { FiChevronLeft, FiTrash2 } from 'react-icons/fi'
import classNames from 'classnames'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import {
  ChatMessageType,
  ClientChat,
  ClientChatMessage,
} from '@/data/types/chats'
import BasicSpinner from '@/components/BasicSpinner'
import ChatThread from '@/components/chat/ChatThread'
import { useApi } from '@/utils/frontend/api'
import { PostChatMessagePayload } from '@/data/frontend/fetches/postChatMessage'
import { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { QueryKeys } from '@/data/types/queries'
import { sendChatMessage } from '@/data/frontend/mutations/sendChatMessage'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isDev } from '@/utils/frontend/env'
import { queryChatMessages } from '@/data/frontend/queries/queryChatMessages'
import { PaginatedResult } from '@/data/types/common'

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
  const queryClient = useQueryClient()

  const { data: messages } = useQuery<PaginatedResult<ClientChatMessage>>({
    queryKey: [QueryKeys.CHAT_MESSAGES, chat.id],
    queryFn: async () => queryChatMessages(api, chat.id, sharedKey),
    throwOnError: isDev,
    enabled: !!api.user && !!sharedKey,
  })

  const mutation = useMutation({
    mutationFn: async (arg: PostChatMessagePayload) =>
      sendChatMessage(api, chat.id, arg, sharedKey),
    onSuccess: () => {
      // Reload chat messages
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CHAT_MESSAGES, chat.id],
      })
    },
    onError: (error) => {
      console.error('Error sending message:', error)
    },
  })

  const handleSend = useCallback(
    async (
      message: string,
      attachment?:
        | { type: 'general'; value: File }
        | { type: 'market-listing'; value: MarketListingSearchResult },
    ) => {
      if (!message.trim() && !attachment) {
        console.warn('Message input is empty')
        return false
      }

      if (!api.user) {
        console.warn('User is not yet authenticated')
        return false
      }

      let payload: PostChatMessagePayload
      if (!attachment) {
        payload = {
          type: ChatMessageType.Text,
          content: message,
        }
      } else if (attachment.type === 'market-listing') {
        payload = {
          type: ChatMessageType.MarketListing,
          content: attachment.value.id.toString(),
        }
      } else if (attachment.type === 'general') {
        payload = {
          type: ChatMessageType.Attachment,
          content: await attachment.value.arrayBuffer(),
          contentFilename: attachment.value.name,
        }
      } else {
        throw new Error('Invalid attachment type')
      }

      try {
        await mutation.mutateAsync(payload)
      } catch (error) {
        console.error('Error sending message:', error)
        return false
      }

      return true
    },
    [api, mutation],
  )

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
          <h3 className='font-medium'>{otherParty?.username}</h3>
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
        messages={messages?.data ?? []}
        sharedKey={sharedKey}
        wasRequestedToDelete={chat.wasRequestedToDelete}
        onSend={handleSend}
        onDeleteChat={onDeleteChat}
      />
      {/* </div> */}
    </section>
  )
}

export default ChatBox
