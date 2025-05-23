import React, { useCallback } from 'react'
import { FiExternalLink, FiX } from 'react-icons/fi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { ClientChat } from '@/types/chats'
import { QueryKeys } from '@/types/queries'
import { MarketListingSearchResult } from '@/data/api/mongo/queries/market'
import { queryChatByRecipient } from '@/data/frontend/queries/queryChatByRecipient'
import ChatThread from '@/components/chat/ChatThread'
import { sendChatMessage } from '@/data/frontend/mutations/sendChatMessage'
import { PostChatMessagePayload } from '@/data/frontend/fetches/postChatMessage'
import { createNewChatByUserId } from '@/data/frontend/mutations/createNewChatByUserId'
import { useApi } from '@/hooks/useApi'
import Link from 'next/link'
import { useChatMessages } from '@/hooks/useChatMessages'

export interface HoveringChatBoxProps {
  otherParty: ClientChat['participants'][number]
  sharedKey: CryptoKey
  onClose?: () => void
  initialPreviewMarketListing?: MarketListingSearchResult
}

const HoveringChatBox: React.FC<HoveringChatBoxProps> = ({
  initialPreviewMarketListing,
  otherParty,
  sharedKey,
  onClose,
}) => {
  const api = useApi()
  const queryClient = useQueryClient()

  const { data: chat } = useQuery<ClientChat | undefined>({
    queryKey: [QueryKeys.CHAT_WITH_RECIPIENT, otherParty.id],
    queryFn: () =>
      queryChatByRecipient(api, otherParty.id).catch(() => undefined),
    enabled: !!api.user,
    staleTime: 5 * 1000,
    refetchInterval: 60 * 1000,
  })

  const { messages } = useChatMessages(api, chat?.id, sharedKey)

  const mutation = useMutation({
    mutationFn: async (arg: PostChatMessagePayload) => {
      // Either get existing chat or create a new one
      let chatId = chat?.id
      if (!chatId) {
        const chatResult = await createNewChatByUserId(api, otherParty.id)
        chatId = chatResult.id

        if (chatResult.alreadyExists) {
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.CHAT_WITH_RECIPIENT, otherParty.id],
          })
        }
      }

      // Send the message using the chat ID
      await sendChatMessage(api, chatId, arg, sharedKey)

      return chatId
    },
    onSuccess: (chatId: string) => {
      // Reload chat messages
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CHAT_MESSAGES, chatId],
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CHAT_WITH_RECIPIENT, otherParty.id],
      })
    },
  })

  const handleSend = useCallback(
    async (message: PostChatMessagePayload) => {
      try {
        await mutation.mutateAsync(message)
      } catch (error) {
        console.error('Error sending message:', error)
        return false
      }

      return true
    },
    [mutation],
  )

  return (
    <div className='fixed bottom-4 right-4 z-20 flex h-[36rem] w-80 flex-col rounded-lg border-2 border-black bg-background shadow-xl md:w-96 dark:border-[#343434]'>
      {/* Chat Header */}
      <div className='flex items-center justify-between rounded-t-lg border-x border-b border-foreground/10 bg-background-light py-3 pl-3 pr-2'>
        {/* Added border-l, border-r, and rounded-t-lg */}
        <div className='flex items-center gap-2'>
          <div className='flex size-8 items-center justify-center rounded-full bg-foreground/10 text-foreground'>
            {(otherParty.username ?? otherParty.id.toString())
              .charAt(0)
              .toUpperCase()}
          </div>
          <div className='flex-1'>
            <p
              className='line-clamp-1 text-sm font-medium'
              title={otherParty.username ?? otherParty.id.toString()}
            >
              {otherParty.username ?? otherParty.id.toString()}
            </p>

            {initialPreviewMarketListing && (
              <p
                className='line-clamp-1 text-xs text-foreground/70'
                title={initialPreviewMarketListing.title}
              >
                {initialPreviewMarketListing.title}
              </p>
            )}
          </div>
        </div>
        <div className='flex-1' />
        {chat && (
          <Link
            href={`/dashboard/messages/${chat.id}`}
            onClick={onClose}
            className='p-2 text-foreground/70 hover:text-foreground'
            rel='noopener noreferrer'
            target='_blank'
          >
            <FiExternalLink size={20} />
          </Link>
        )}
        <button
          onClick={onClose}
          className='p-2 text-foreground/70 hover:text-foreground'
        >
          <FiX size={20} />
        </button>
      </div>

      <ChatThread
        messages={messages.data ?? []}
        sharedKey={sharedKey}
        wasRequestedToDelete={chat?.wasRequestedToDelete}
        initialPreviewMarketListing={initialPreviewMarketListing}
        onSend={handleSend}
      />
    </div>
  )
}

export default HoveringChatBox
