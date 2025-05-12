import classNames from 'classnames'
import Link from 'next/link'
import React from 'react'

export interface MobileBottomNavProps {
  navItems: {
    key: string
    path: string
    icon: React.ReactNode
    label: string
  }[]
  value: string
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  navItems,
  value,
}) => {
  return (
    <aside className='max-w-screen-sm border-t-2 border-foreground/10 bg-background p-2'>
      <nav className='flex w-full flex-row flex-nowrap justify-around'>
        {navItems.map((item) => (
          <Link
            key={item.key}
            className={classNames(
              'p-2 rounded-md transition-colors',
              item.key === value
                ? 'text-foreground'
                : 'text-foreground/50 hover:text-foreground',
            )}
            href={item.path}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default MobileBottomNav
