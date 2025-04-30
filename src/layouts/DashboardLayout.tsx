import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import {
  FiHome,
  FiPackage,
  FiMessageSquare,
  FiSettings,
  FiList,
} from 'react-icons/fi'
import { useQueryClient } from '@tanstack/react-query'

import Sidebar from '@/components/Sidebar'
import { geistMono, geistSans } from '@/styles/fonts'
import { QueryKeys } from '@/data/types/queries'
import { PageWithLayout } from '@/data/types/layout'
import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { queryChats } from '@/data/frontend/queries/queryChats'
import { ApiProvider, useApi } from '@/utils/frontend/api'

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
    path: '/dashboard',
    icon: <FiHome className='w-5 h-5 min-w-5' />,
    label: 'Home',
  },
  {
    key: Page.MARKETPLACE,
    path: '/dashboard/marketplace',
    icon: <FiPackage className='w-5 h-5 min-w-5' />,
    label: 'Marketplace',
  },
  {
    key: Page.MY_LISTINGS,
    path: '/dashboard/my-listings',
    icon: <FiList className='w-5 h-5 min-w-5' />,
    label: 'My Listings',
  },
  {
    key: Page.MESSAGES,
    path: '/dashboard/messages',
    icon: <FiMessageSquare className='w-5 h-5 min-w-5' />,
    label: 'Messages',
  },
  {
    key: Page.SETTINGS,
    path: '/dashboard/settings',
    icon: <FiSettings className='w-5 h-5 min-w-5' />,
    label: 'Settings',
  },
]

for (const item of navItems) {
  Object.freeze(item)
}

export interface DashboardLayoutProps {
  children?: React.ReactNode
}

const DashboardLayout: PageWithLayout<DashboardLayoutProps> = ({
  children,
}) => {
  const router = useRouter()
  const api = useApi()

  const pathMatches = /^(\/dashboard\/[a-zA-Z0-9_-]+)\/?/.exec(router.pathname)
  const activePage = pathMatches?.[1]
    ? navItems.find((item) => item.path === pathMatches[1])?.key ?? undefined
    : Page.HOME

  useEffect(() => {
    if (activePage == null) {
      router.replace('/dashboard')
    }
  }, [activePage, router])

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
          <Sidebar navItems={navItems} value={activePage ?? ''} />
        </div>
        {/* Main content */}
        <main className='flex-1 p-6 pb-16 sm:pb-0 sm:ml-64'>{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className='fixed bottom-0 bg-background border-t-2 border-foreground/10 flex justify-around p-2 sm:hidden z-10 w-full max-w-screen-sm mx-auto inset-x-0'>
        {navItems.map((item) => (
          <button
            key={item.key}
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

DashboardLayout.PageLayout = function DashboardLayoutPageLayout({
  children,
}: DashboardLayoutProps) {
  return <ApiProvider>{children}</ApiProvider>
}

export default DashboardLayout
