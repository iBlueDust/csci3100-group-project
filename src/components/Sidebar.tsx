import classNames from 'classnames'
import Link from 'next/link'
import React from 'react'
import { FiLogOut } from 'react-icons/fi'

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
  return (
    <aside className='w-16 sm:w-64 border-r-2 border-foreground/10 h-[calc(100vh-4rem)] p-4 flex flex-col'>
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
        <Link
          href='/login'
          className='flex items-center gap-3 px-3 py-2 rounded-md hover:bg-background-dark w-full transition-colors text-red-500 mt-1'
        >
          <FiLogOut className='w-5 h-5 min-w-5' />
          <span className='hidden sm:inline'>Logout</span>
        </Link>
      </nav>

      {/* Remove the div with mt-auto class that previously contained the logout link */}
      <div className='mt-auto'>
        {/* You can keep this div empty or remove it if it's no longer needed */}
      </div>
    </aside>
  )
}

export default Sidebar
