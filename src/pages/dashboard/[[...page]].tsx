import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import classNames from 'classnames'
import { FiHome, FiPackage, FiMessageSquare, FiSettings } from 'react-icons/fi'

import { geistMono, geistSans } from '@/styles/fonts'
import Sidebar from '@/components/Sidebar'
import type { PageWithLayout } from '@/data/types/layout'
import { ApiProvider, useApi } from '@/utils/frontend/api'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKeys } from '@/data/types/queries'
import { getChats } from '@/data/frontend/queries/getChats'
import { searchMarketListings } from '@/data/frontend/queries/searchMarketListings'
import { useRouter } from 'next/router'

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

const Dashboard: PageWithLayout = () => {
  const router = useRouter()
  const api = useApi()
  // Mock data for recent listings/trades

  const queryClient = useQueryClient()
  useEffect(() => {
    if (!api) {
      console.warn('Not logged in. Returning to home screen...')
      router.replace('/')
    }

    queryClient.prefetchQuery({
      queryKey: [QueryKeys.CHATS],
      queryFn: () => getChats(api),
    })
    queryClient.prefetchQuery({
      queryKey: [QueryKeys.MARKET_LISTINGS],
      queryFn: () => searchMarketListings(api),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api])

  const pageKeys: (string | undefined)[] = [
    undefined,
    Page.MARKETPLACE,
    Page.MESSAGES,
    Page.SETTINGS,
  ]
  // Only
  // /dashboard
  // /dashboard/marketplace
  // /dashboard/messages
  // /dashboard/settings
  // are recognized. No nested routes.
  const activePage =
    pageKeys.includes(router.query.page?.[0]) &&
    (!router.query.page || router.query.page.length === 1)
      ? router.query.page?.[0] || Page.HOME
      : null // 404

  // Redirect to /dashboard if activePage is null (invalid route)
  useEffect(() => {
    if (activePage == null) {
      router.replace('/dashboard')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  return (
    <div
      className={classNames(
        geistSans.variable,
        geistMono.variable,
        'min-h-screen font-body bg-background',
      )}
    >
      {/* Header */}
      <header className='h-16 px-6 border-b border-foreground/10 flex items-center justify-between'>
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
          value={activePage ?? ''}
          onChange={(page) => router.replace(`/dashboard/${page}`)}
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

Dashboard.PageLayout = function DashboardLayout({ children }) {
  return <ApiProvider>{children}</ApiProvider>
}

export default Dashboard
