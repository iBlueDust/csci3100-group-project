import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

import { exportKey, importKey } from './e2e'

const API_ENDPOINT =
  process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000/api'

export interface ApiState {
  isInitialized: boolean
  user?: { id: string; username: string }
  setUser: (user: ApiState['user']) => void
  tokenExpiresAt?: Date
  setTokenExpiresAt: (tokenExpiresAt?: Date) => void
  uek?: CryptoKeyPair
  setUek: (keyPair?: CryptoKeyPair) => void
}

const ApiContext = React.createContext<ApiState>({
  isInitialized: false,
  setUser: () => {},
  setTokenExpiresAt: () => {},
  setUek: () => {},
})

export const queryClient = new QueryClient()

export interface ApiProviderProps {
  children: React.ReactNode
}
export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [user, _setUser] = useState<ApiState['user']>(undefined)
  const [isInitialized, setIsInitialized] = useState(false)

  const setUser = useCallback((user: ApiState['user']) => {
    _setUser(user)

    // cache user
    if (user) {
      localStorage.setItem('auth.id', user.id)
      localStorage.setItem('auth.username', user.username)
    } else {
      localStorage.removeItem('auth.id')
      localStorage.removeItem('auth.username')
    }
  }, [])

  const [tokenExpiresAt, _setTokenExpiresAt] = useState<Date | undefined>(
    undefined,
  )

  const setTokenExpiresAt = useCallback((tokenExpiresAt?: Date) => {
    _setTokenExpiresAt(tokenExpiresAt)
    if (tokenExpiresAt) {
      localStorage.setItem('auth.tokenExpiresAt', tokenExpiresAt.toISOString())
    } else {
      localStorage.removeItem('auth.tokenExpiresAt')
    }
  }, [])

  const [uek, _setUek] = useState<CryptoKeyPair | undefined>(undefined)

  const setUek = useCallback(async (uek?: CryptoKeyPair) => {
    _setUek(uek)
    if (!uek) {
      localStorage.removeItem('auth.uek')
      return
    }

    let uekPublicKeyBytes: JsonWebKey
    let uekPrivateKeyBytes: JsonWebKey
    try {
      await Promise.all([
        exportKey(uek.publicKey, 'jwk').then((key) => {
          uekPublicKeyBytes = key
        }),
        exportKey(uek.privateKey, 'jwk').then((key) => {
          uekPrivateKeyBytes = key
        }),
      ])
    } catch (error) {
      console.error('Failed to export user encryption key', error)
      return
    }

    const uekEncoded = JSON.stringify([uekPublicKeyBytes!, uekPrivateKeyBytes!])
    localStorage.setItem('auth.uek', uekEncoded)
  }, [])

  // load user from local storage
  useEffect(() => {
    const loadUser = async () => {
      const id = localStorage.getItem('auth.id')
      const username = localStorage.getItem('auth.username')
      const tokenExpiresAt = localStorage.getItem('auth.tokenExpiresAt')
      const uekEncoded = localStorage.getItem('auth.uek')
      const isTokenExpiresAtValid = dayjs(tokenExpiresAt).isValid()

      if (!id) return
      if (!username) return
      if (!tokenExpiresAt) return
      if (!isTokenExpiresAtValid) return
      if (!uekEncoded) return

      try {
        const [uekPublicKey, uekPrivateKey] = JSON.parse(uekEncoded)
        // uekPublicKey.key_ops = []
        uekPrivateKey.key_ops = ['deriveKey', 'deriveBits']

        const uek: Partial<CryptoKeyPair> = {}

        await Promise.all([
          importKey(uekPublicKey, 'jwk', []).then(
            (key) => (uek.publicKey = key),
          ),
          importKey(uekPrivateKey, 'jwk', ['deriveKey']).then(
            (key) => (uek.privateKey = key),
          ),
        ])

        _setUek(uek as CryptoKeyPair)
      } catch (error) {
        console.warn('Failed to import user encryption key', error)
        return
      }

      // If user was set somewhere else, don't override it
      const user = { id, username }
      console.log('Loaded user from local storage', user)
      _setUser((prev) => prev ?? user)
      _setTokenExpiresAt(new Date(tokenExpiresAt))
    }

    loadUser().finally(() => setIsInitialized(true))
  }, [])

  const value = useMemo(
    () => ({
      isInitialized,
      user,
      setUser,
      tokenExpiresAt,
      setTokenExpiresAt,
      uek,
      setUek,
    }),
    [
      isInitialized,
      user,
      setUser,
      tokenExpiresAt,
      setTokenExpiresAt,
      uek,
      setUek,
    ],
  )

  return (
    <ApiContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  )
}

export interface Api {
  isInitialized: boolean
  user?: { id: string; username: string }
  setUser: (user: Api['user']) => void
  tokenExpiresAt?: Date
  setTokenExpiresAt: (tokenExpiresAt?: Date) => void
  uek?: CryptoKeyPair
  setUek: (keyPair?: CryptoKeyPair) => void
  fetch: (url: string, options?: RequestInit) => Promise<Response>
}

export const useApi = (): Api => {
  const router = useRouter()

  const context = React.useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }

  const refreshToken = useCallback(async () => {
    console.log('Token expired, refreshing')

    const response = await fetch(API_ENDPOINT + '/auth/refresh', {
      method: 'POST',
    }).catch((error) => {
      console.error('Error refreshing token:', error)
      return null
    })

    if (!response?.ok) {
      console.error('Failed to refresh token', response?.statusText)
      console.error('Logging out user')
      context.setUser(undefined)
      context.setTokenExpiresAt(undefined)
      router.push('/login')
      return
    }

    const body = await response.json()
    context.setTokenExpiresAt(new Date(body.expiresAt))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.setTokenExpiresAt, context.setUser, router])

  const apiFetch = useCallback(
    async (url: string, options?: RequestInit) => {
      let wasTokenRefreshed = false

      if (context.tokenExpiresAt) {
        const expiresAt = dayjs(context.tokenExpiresAt)
        // Check if token is expired or will expire in the next minute
        const isTokenExpired = expiresAt.isBefore(dayjs().add(1, 'minute'))

        if (isTokenExpired) {
          await refreshToken()
          wasTokenRefreshed = true
        }
      }

      const response = await fetch(API_ENDPOINT + url, options)

      if (response.status === 401 && !wasTokenRefreshed) {
        await refreshToken()

        // Retry the request after refreshing the token
        return await fetch(API_ENDPOINT + url, options)
      }

      return response
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context.tokenExpiresAt, refreshToken, router],
  )

  return useMemo(
    () => ({
      isInitialized: context.isInitialized,
      user: context.user,
      setUser: context.setUser,
      fetch: apiFetch,
      tokenExpiresAt: context.tokenExpiresAt,
      setTokenExpiresAt: context.setTokenExpiresAt,
      uek: context.uek,
      setUek: context.setUek,
    }),
    [context, apiFetch],
  )
}
