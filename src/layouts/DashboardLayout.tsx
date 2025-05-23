import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { FiHome, FiPackage, FiMessageSquare, FiSettings } from 'react-icons/fi'
import { useQueryClient } from '@tanstack/react-query'

import Sidebar from '@/components/Sidebar'
import { geistMono, geistSans } from '@/styles/fonts'
import { QueryKeys } from '@/types/queries'
import { PageWithLayout } from '@/types/layout'
import { queryMarketListings } from '@/data/frontend/queries/queryMarketListings'
import { queryChats } from '@/data/frontend/queries/queryChats'
import { ApiProvider, useApi } from '@/hooks/useApi'
import MobileBottomNav from '@/components/MobileBottomNav'
import UserAvatar from '@/components/UserAvatar'

enum Page {
  HOME = 'home',
  MARKETPLACE = 'marketplace',
  MESSAGES = 'messages',
  SETTINGS = 'settings',
}

const navItems = [
  {
    key: Page.HOME,
    path: '/dashboard',
    icon: <FiHome className='size-5 min-w-5' />,
    label: 'Home',
  },
  {
    key: Page.MARKETPLACE,
    path: '/dashboard/marketplace',
    icon: <FiPackage className='size-5 min-w-5' />,
    label: 'Marketplace',
  },
  {
    key: Page.MESSAGES,
    path: '/dashboard/messages',
    icon: <FiMessageSquare className='size-5 min-w-5' />,
    label: 'Messages',
  },
  {
    key: Page.SETTINGS,
    path: '/dashboard/settings',
    icon: <FiSettings className='size-5 min-w-5' />,
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

  const activePage = useMemo(() => {
    const pathMatches = /^(\/dashboard\/[a-zA-Z0-9_-]+)\/?/.exec(
      router.pathname,
    )
    return pathMatches?.[1]
      ? navItems.find((item) => item.path === pathMatches[1])?.key ?? undefined
      : Page.HOME
  }, [router.pathname])

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
      <header className='fixed inset-x-0 top-0 z-10 flex h-16 items-center justify-between border-b-2 border-foreground/10 bg-background px-6'>
        <Link href='/' className='text-xl font-bold'>
          The Jade Trail
        </Link>

        <div className='flex cursor-default items-center gap-4'>
          {/* User Avatar or Placeholder */}
          <UserAvatar username={api.user?.username ?? ''} />

          <span className='hidden sm:inline'>{api.user?.username ?? '--'}</span>
        </div>
      </header>

      <div className='flex flex-col pt-16 sm:flex-row'>
        {' '}
        {/* Stack on mobile, row on sm+ */}
        {/* Fixed Sidebar (hidden on mobile) */}
        <div className='fixed bottom-0 left-0 top-16 hidden sm:block'>
          {/* Sidebar */}
          <Sidebar navItems={navItems} value={activePage ?? ''} />
        </div>
        {/* Main content */}
        <main className='flex-1 p-6 pb-16 sm:ml-64 sm:pb-0'>{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className='fixed inset-x-0 bottom-0 z-10 sm:hidden'>
        <MobileBottomNav navItems={navItems} value={activePage ?? ''} />
      </div>
    </div>
  )
}

DashboardLayout.getLayout = (page) => {
  return <ApiProvider>{page}</ApiProvider>
}

export default DashboardLayout
