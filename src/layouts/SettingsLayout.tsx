import { useEffect } from 'react'
import { FiUser, FiShield } from 'react-icons/fi'

import type { PageWithLayout } from '@/data/types/layout'
import classNames from 'classnames'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useRouter } from 'next/router'
import Link from 'next/link'

export interface SettingsLayoutProps {
  children?: React.ReactNode
}

const SettingsLayout: PageWithLayout<SettingsLayoutProps> = ({ children }) => {
  const router = useRouter()

  const pathMatches = /^\/dashboard\/settings(\/[a-zA-Z0-9_-]+)/.exec(
    router.pathname,
  )
  const activeTab = pathMatches?.[1] ?? ''

  useEffect(() => {
    if (!['', '/', '/privacy'].includes(activeTab)) {
      router.replace('/dashboard/settings')
    }
  }, [activeTab, router])

  return (
    <div className='h-full flex flex-col'>
      <h2 className='text-3xl font-bold mb-6'>Settings</h2>

      {/* Tabs Navigation - removed the notifications tab */}
      <div className='flex border-b-2 border-foreground/10 mb-6 overflow-x-auto hide-scrollbar'>
        <Link
          href='/dashboard/settings'
          replace
          className={`flex items-center gap-1 px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === '' || activeTab === '/'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-foreground/50 hover:text-foreground/80'
          }`}
        >
          <FiUser className='w-4 h-4' />
          <span>Profile</span>
        </Link>

        <Link
          href='/dashboard/settings/privacy'
          replace
          className={classNames(
            'flex items-center gap-1 px-4 py-2 border-b-2 font-medium transition-colors',
            activeTab === '/privacy'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-foreground/50 hover:text-foreground/80',
          )}
        >
          <FiShield className='w-4 h-4' />
          <span>Privacy</span>
        </Link>
      </div>

      {/* Tab Content */}
      <div className='bg-background rounded-lg flex-1 overflow-y-auto'>
        <div className='p-6'>{children}</div>
      </div>
    </div>
  )
}

SettingsLayout.PageLayout = function SettingsMetaLayout({ children }) {
  const GrandfatherLayout =
    DashboardLayout.PageLayout ?? (({ children }) => children)
  return (
    <GrandfatherLayout>
      <DashboardLayout>{children}</DashboardLayout>
    </GrandfatherLayout>
  )
}

export default SettingsLayout
