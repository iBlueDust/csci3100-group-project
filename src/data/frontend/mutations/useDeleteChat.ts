import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteChat } from '../fetches/deleteChat'
import { QueryKeys } from '@/data/types/queries'
import type { Api } from '@/utils/frontend/api'

export function useDeleteChat(api: Api) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chatId: string) => deleteChat(api, chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.CHATS] })
    },
  })
}
