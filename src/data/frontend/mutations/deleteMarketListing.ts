import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteMarketListing } from '../fetches/deleteMarketListing'
import { QueryKeys } from '@/data/types/queries'
import type { Api } from '@/utils/frontend/api'

export function useDeleteMarketListing(api: Api) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (listingId: string) => deleteMarketListing(api, listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MARKET_LISTINGS] })
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MARKET_LISTINGS, 'mine'] })
    },
  })
}
