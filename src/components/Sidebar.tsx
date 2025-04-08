import classNames from 'classnames'
import React, { useCallback } from 'react'
import { FiLogOut } from 'react-icons/fi'

import { api } from '@/utils/frontend'
import { useRouter } from 'next/router'

export interface SidebarProps {
  navItems: {
    key: string | number
    label: React.ReactNode
    icon?: React.ReactNode
    isActive?: boolean
    onClick?: () => void
  }[]
  value?: string | number
  onChange?: (value: string | number) => void
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, value, onChange }) => {
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

      router.replace('/')
    } catch (error) {
      console.error('Logout error:', error)
      onError()
    }
  }, [router])

  return (
    <aside className='w-16 sm:w-64 border-r border-foreground/10 h-[calc(100vh-4rem)] p-4 flex flex-col'>
      <nav className='space-y-1'>
        {navItems.map((item) => (
          <button
            key={item.key}
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
          </button>
        ))}

        {/* Logout button moved here, right after the settings button */}
        <button
          className='flex items-center gap-3 px-3 py-2 rounded-md hover:bg-background-dark w-full transition-colors text-red-500 mt-1'
          onClick={logoutHandler}
        >
          <FiLogOut className='w-5 h-5 min-w-5' />
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
