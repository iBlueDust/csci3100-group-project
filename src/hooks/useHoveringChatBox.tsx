import { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { Api } from '@/utils/frontend/api'
import { deriveKey, importKey } from '@/utils/frontend/e2e'
import dynamic from 'next/dynamic'
import React, { useCallback, useContext, useState } from 'react'
const HoveringChatBox = dynamic(() => import('@/components/HoveringChatBox'), {
  ssr: false,
})

interface HoveringChatBoxProviderState {
  isShowing: boolean
  show: (listing: MarketListingSearchResult) => void
  hide: () => void
  setSharedKey: (key: CryptoKey | null) => void
}

export const HoveringChatBoxContext =
  React.createContext<HoveringChatBoxProviderState>({
    isShowing: false,
    show: () => {},
    hide: () => {},
    setSharedKey: () => {},
  })

export const HoveringChatBoxProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [listing, setListing] = useState<
    MarketListingSearchResult | undefined
  >()
  const [sharedKey, setSharedKey] = useState<CryptoKey | null>(null)

  const isShowing = !!listing

  const show = setListing
  const hide = useCallback(() => {
    setListing(undefined)
  }, [])

  return (
    <HoveringChatBoxContext.Provider
      value={{ isShowing, hide, show, setSharedKey }}
    >
      {children}

      {listing && sharedKey && (
        <HoveringChatBox
          otherParty={{
            ...listing.author,
            username: listing.author.username ?? listing.author.id.toString(),
            id: listing.author.id.toString(),
          }}
          sharedKey={sharedKey}
          onClose={hide}
          initialPreviewMarketListing={listing}
        />
      )}
    </HoveringChatBoxContext.Provider>
  )
}

export const useHoveringChatBox = ({ api }: { api: Api }) => {
  const context = useContext(HoveringChatBoxContext)
  if (!context) {
    throw new Error(
      'useHoveringChatBox must be used within a HoveringChatBoxProvider',
    )
  }

  const show = useCallback(
    async (listing: MarketListingSearchResult) => {
      context.show(listing)
      if (!api.uek) {
        return
      }

      const myPrivateKey = api.uek.privateKey
      const theirPublicKey = await importKey(
        listing.author.publicKey,
        'jwk',
        [],
      )
      const sharedKey = await deriveKey(theirPublicKey, myPrivateKey)
      context.setSharedKey(sharedKey)
    },
    [context, api.uek],
  )

  return {
    show,
    hide: context.hide,
    isShowing: context.isShowing,
  }
}
