import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import classNames from 'classnames'
import { FiHome, FiPackage, FiMessageSquare, FiSettings } from 'react-icons/fi'

import { geistMono, geistSans } from '@/styles/fonts'
import Sidebar from '@/components/Sidebar'

// TODO: Add loading component
const Home = dynamic(() => import('@/components/Home'), { ssr: false })
const Messages = dynamic(() => import('@/components/messages'), { ssr: false })
const Marketplace = dynamic(() => import('@/components/marketplace'), {
  ssr: false,
})
const Settings = dynamic(() => import('@/components/settings'), { ssr: false })

enum Page {
  HOME = 'home',
  MARKETPLACE = 'marketplace',
  MESSAGES = 'messages',
  SETTINGS = 'settings',
}

const navItems = [
  {
    key: Page.HOME,
    icon: <FiHome className='w-5 h-5 min-w-5' />,
    label: 'Home',
  },
  {
    key: Page.MARKETPLACE,
    icon: <FiPackage className='w-5 h-5 min-w-5' />,
    label: 'Marketplace',
  },
  {
    key: Page.MESSAGES,
    icon: <FiMessageSquare className='w-5 h-5 min-w-5' />,
    label: 'Messages',
  },
  {
    key: Page.SETTINGS,
    icon: <FiSettings className='w-5 h-5 min-w-5' />,
    label: 'Settings',
  },
]

export default function Dashboard() {
  const [activePage, setActivePage] = useState(Page.HOME)
  // Mock data for recent listings/trades

  return (
    <div
      className={classNames(
        geistSans.variable,
        geistMono.variable,
        'min-h-screen font-body bg-background',
      )}
    >
      {/* Header */}
      <header className='h-16 px-6 border-b-2 border-foreground/10 flex items-center justify-between'>
        <Link href='/' className='font-bold text-xl'>
          The Jade Trail
        </Link>
        <div className='flex items-center'>
          {/* User Avatar or Placeholder */}
          <div className='w-8 h-8 rounded-full bg-foreground/10 mr-2' />
          <span>Username</span>
        </div>
      </header>

      <div className='flex'>
        {/* Sidebar */}
        <Sidebar
          navItems={navItems}
          value={activePage}
          onChange={setActivePage as (value: string | number) => void}
        />

        {/* Main content */}
        <main className='flex-1 p-6'>
          {activePage === Page.HOME && <Home />}

          {activePage === Page.MESSAGES && <Messages />}

          {activePage === Page.MARKETPLACE && <Marketplace />}

          {activePage === Page.SETTINGS && <Settings />}
        </main>
      </div>
    </div>
  )
}
