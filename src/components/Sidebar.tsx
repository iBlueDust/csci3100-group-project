import classNames from 'classnames'
import React, { useCallback } from 'react'
import { FiLogOut } from 'react-icons/fi'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { useApi } from '@/hooks/useApi'

export interface SidebarProps {
  navItems: {
    key: string | number
    path: string
    label: React.ReactNode
    icon?: React.ReactNode
    isActive?: boolean
    onClick?: () => void
  }[]
  value?: string | number
  onChange?: (value: string | number) => void
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, value, onChange }) => {
  const api = useApi()
  const router = useRouter()

  const logoutHandler = useCallback(async () => {
    const onError = () => {
      alert(
        'Logout failed. In emergencies, press CTRL+SHIFT+DELETE and clear cookies.',
      )
    }

    try {
      const response = await api.fetch('/auth/logout', { method: 'DELETE' })

      if (!response.ok) {
        onError()
        return
      }

      api.setUser(undefined)
      api.setTokenExpiresAt(undefined)
      api.setUek(undefined)
      router.replace('/')
    } catch (error) {
      console.error('Logout error:', error)
      onError()
    }
  }, [router, api])

  return (
    <aside className='flex h-full min-h-screen w-16 flex-col border-r-2 border-foreground/10 bg-background p-4 sm:w-64'>
      {' '}
      {/* Added bg-background, removed sticky top-0 */}
      <nav className='space-y-1'>
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.path}
            onClick={() => {
              item.onClick?.()
              onChange?.(item.key)
            }}
            className={classNames(
              'flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors',
              item.key === value
                ? 'bg-foreground text-background'
                : 'hover:bg-background-dark',
            )}
          >
            {item.icon}
            <span className='hidden sm:inline'>{item.label}</span>
          </Link>
        ))}

        {/* Logout button moved here, right after the settings button */}
        <button
          className='mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-red-500 transition-colors hover:bg-background-dark'
          onClick={logoutHandler}
        >
          <FiLogOut className='size-5 min-w-5' />
          <span className='hidden sm:inline'>Logout</span>
        </button>
      </nav>
      {/* Remove the div with mt-auto class that previously contained the logout link */}
      <div className='mt-auto'>
        {/* You can keep this div empty or remove it if it's no longer needed */}
      </div>
    </aside>
  )
}

export default Sidebar
