import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ClientChatMessage } from '@/data/types/chats'
import { PostChatMessagePayload } from '@/data/frontend/fetches/postChatMessage'
import { QueryKeys } from '@/data/types/queries'
import { sendChatMessage } from '@/data/frontend/mutations/sendChatMessage'
import { isDev } from '@/utils/frontend/env'
import { queryChatMessages } from '@/data/frontend/queries/queryChatMessages'
import { PaginatedResult } from '@/data/types/common'
import { Api } from '@/utils/frontend/api'
import { useCallback } from 'react'

export const useChatMessages = (
  api: Api,
  chatId: string | undefined,
  sharedKey: CryptoKey,
) => {
  const queryClient = useQueryClient()

  const messages = useQuery<PaginatedResult<ClientChatMessage>>({
    queryKey: [QueryKeys.CHAT_MESSAGES, chatId],
    queryFn: async () => queryChatMessages(api, chatId!, sharedKey),
    throwOnError: isDev,
    enabled: !!api.user && !!chatId && !!sharedKey,
    staleTime: 1000,
    refetchInterval: 5 * 1000,
    refetchOnWindowFocus: true,
  })

  const mutation = useMutation({
    mutationFn: async ([chatId, arg]: [string, PostChatMessagePayload]) =>
      sendChatMessage(api, chatId, arg, sharedKey),
    onSuccess: () => {
      // Reload chat messages
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CHAT_MESSAGES, chatId],
      })
    },
    onError: (error) => {
      console.error('Error sending message:', error)
    },
  })

  const sendMessage = useCallback<
    (message: PostChatMessagePayload) => Promise<boolean>
  >(
    async (message: PostChatMessagePayload) => {
      if (!chatId) {
        return false
      }

      try {
        await mutation.mutateAsync([chatId, message])
      } catch (error) {
        console.error('Error sending message:', error)
        return false
      }

      return true
    },
    [mutation, chatId],
  )

  return {
    messages: {
      ...messages,
      data: messages.data?.data as ClientChatMessage[],
      meta: messages.data?.meta as { total: number },
    },
    sendMessage,
    isLoading: messages.isLoading,
    isError: messages.isError || mutation.isError,
  }
}
