import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import {
  FiHome,
  FiPackage,
  FiMessageSquare,
  FiSettings,
  FiList,
  FiHeart,
} from 'react-icons/fi'
import { useQueryClient } from '@tanstack/react-query'

import Sidebar from '@/components/Sidebar'
import { geistMono, geistSans } from '@/styles/fonts'
import type { PageWithLayout } from '@/data/types/layout'
import { QueryKeys } from '@/data/types/queries'
import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { queryChats } from '@/data/frontend/queries/queryChats'
import { ApiProvider, useApi } from '@/utils/frontend/api'

// TODO: Add loading component
const Home = dynamic(() => import('@/components/Home'), { ssr: false })
const Messages = dynamic(() => import('@/components/messages'), { ssr: false })
const Marketplace = dynamic(() => import('@/components/marketplace'), {
  ssr: false,
})
const MyListings = dynamic(() => import('@/components/myListings'), {
  ssr: false,
})
const Settings = dynamic(() => import('@/components/settings'), { ssr: false })

enum Page {
  HOME = 'home',
  MARKETPLACE = 'marketplace',
  MY_LISTINGS = 'my-listings',
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
    key: Page.MY_LISTINGS,
    icon: <FiList className='w-5 h-5 min-w-5' />,
    label: 'My Listings',
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

  const queryClient = useQueryClient()
  useEffect(() => {
    if (!api.isInitialized) return

    if (!api.user || !api.uek) {
      console.warn('Not logged in. Returning to home screen...')
      router.replace('/')
      return
    }

    queryClient.prefetchQuery({
      queryKey: [QueryKeys.CHATS],
      queryFn: () => queryChats(api),
      staleTime: 1000 * 5,
    })
    queryClient.prefetchQuery({
      queryKey: [QueryKeys.MARKET_LISTINGS],
      queryFn: () => queryMarketListings(api),
      staleTime: 1000 * 5,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.isInitialized])

  const pageKeys: (string | undefined)[] = [
    undefined,
    Page.MARKETPLACE,
    Page.MY_LISTINGS,
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
        'w-full max-w-screen-sm mx-auto md:max-w-full md:mx-0 min-h-screen font-body bg-background flex flex-col overflow-x-hidden',
      )}
    >
      {/* Header */}
      <header className='h-16 px-6 border-b-2 border-foreground/10 flex items-center justify-between fixed top-0 left-0 right-0 bg-background z-10'>
        <Link href='/' className='font-bold text-xl'>
          The Jade Trail
        </Link>
        <div className='flex items-center cursor-default gap-4'>
          {/* Favorites Button */}
          <button
            className='relative p-2 rounded-full hover:bg-background-dark'
            onClick={() => {
              // We'll implement this functionality in the Marketplace component
              if (activePage === Page.MARKETPLACE) {
                // Using a custom event to communicate with the Marketplace component
                window.dispatchEvent(new CustomEvent('toggle-favorites'))
              } else {
                router.replace(`/dashboard/${Page.MARKETPLACE}`)
                // We'll use setTimeout to allow the component to mount before dispatching the event
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('show-favorites'))
                }, 100)
              }
            }}
          >
            <FiHeart className='w-5 h-5' />
          </button>

          {/* User Avatar or Placeholder */}
          <div className='w-8 h-8 rounded-full bg-foreground/10 flex justify-center items-center'>
            <span className='font-bold'>
              {api.user?.username.charAt(0) ?? ''}
            </span>
          </div>
          <span className='hidden sm:inline'>{api.user?.username ?? '--'}</span>
        </div>
      </header>

      <div className='flex flex-col sm:flex-row pt-16'>
        {' '}
        {/* Stack on mobile, row on sm+ */}
        {/* Fixed Sidebar (hidden on mobile) */}
        <div className='hidden sm:block fixed left-0 top-16 bottom-0'>
          {/* Sidebar */}
          <Sidebar
            navItems={navItems}
            value={activePage ?? ''}
            onChange={(page) => router.replace(`/dashboard/${page}`)}
          />
        </div>
        {/* Main content */}
        <main className='flex-1 p-6 pb-16 sm:pb-0 sm:ml-64'>
          {activePage === Page.HOME && <Home />}

          {activePage === Page.MESSAGES && <Messages />}

          {activePage === Page.MARKETPLACE && <Marketplace />}

          {activePage === Page.MY_LISTINGS && <MyListings />}

          {activePage === Page.SETTINGS && <Settings />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className='fixed bottom-0 bg-background border-t-2 border-foreground/10 flex justify-around p-2 sm:hidden z-10 w-full max-w-screen-sm mx-auto inset-x-0'>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => router.replace(`/dashboard/${item.key}`)}
            className={classNames(
              'p-2 rounded-md transition-colors',
              item.key === activePage
                ? 'text-foreground'
                : 'text-foreground/50 hover:text-foreground',
            )}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  )
}

Dashboard.PageLayout = function DashboardLayout({ children }) {
  return <ApiProvider>{children}</ApiProvider>
}

export default Dashboard
