import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

const API_ENDPOINT =
  process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000/api'

export interface ApiState {
  user?: { id: string; username: string; tokenExpiresAt: Date }
  setUser: (user: ApiState['user']) => void
}

const ApiContext = React.createContext<ApiState>({
  setUser: () => {},
})

export interface ApiProviderProps {
  children: React.ReactNode
}
export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [user, _setUser] = useState<ApiState['user']>(undefined)

  const setUser = useCallback((user: ApiState['user']) => {
    _setUser(user)

    // cache user
    if (user) {
      localStorage.setItem('auth.id', user.id)
      localStorage.setItem('auth.username', user.username)
      localStorage.setItem(
        'auth.tokenExpiresAt',
        user.tokenExpiresAt.toISOString(),
      )
    } else {
      localStorage.removeItem('auth.id')
      localStorage.removeItem('auth.username')
      localStorage.removeItem('auth.tokenExpiresAt')
    }
  }, [])

  // load user from local storage
  useEffect(() => {
    const id = localStorage.getItem('auth.id')
    const username = localStorage.getItem('auth.username')
    const tokenExpiresAt = localStorage.getItem('auth.tokenExpiresAt')
    const isTokenExpiresAtValid = dayjs(tokenExpiresAt).isValid()

    if (id && username && tokenExpiresAt && isTokenExpiresAtValid) {
      // If user was set somewhere else, don't override it
      const user = { id, username, tokenExpiresAt: new Date(tokenExpiresAt) }
      console.log('Loaded user from local storage', user)
      _setUser((prev) => prev ?? user)
    }
  }, [])

  const value = useMemo(() => ({ user, setUser }), [user, setUser])

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

const apiFetch = async (url: string, options?: RequestInit) => {
  return await fetch(API_ENDPOINT + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
}

export const useApi = () => {
  const context = React.useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }

  return useMemo(
    () => ({
      user: context.user,
      setUser: context.setUser,
      fetch: apiFetch,
    }),
    [context],
  )
}
