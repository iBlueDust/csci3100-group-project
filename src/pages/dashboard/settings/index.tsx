import { useState } from 'react'
import { FiUser, FiShield } from 'react-icons/fi'
import dynamic from 'next/dynamic'

import type { PageWithLayout } from '@/data/types/layout'
import classNames from 'classnames'
import DashboardLayout from '@/layouts/DashboardLayout'
const SettingsProfileTab = dynamic(
  () => import('../../../components/SettingsProfileTab'),
)
const SettingsPrivacyTab = dynamic(
  () => import('../../../components/SettingsPrivacyTab'),
)

// Tab interfaces
type SettingsTab = 'profile' | 'privacy'

const Settings: PageWithLayout = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <SettingsProfileTab />

      case 'privacy':
        return <SettingsPrivacyTab />
    }
  }

  return (
    <div className='h-full flex flex-col'>
      <h2 className='text-3xl font-bold mb-6'>Settings</h2>

      {/* Tabs Navigation - removed the notifications tab */}
      <div className='flex border-b-2 border-foreground/10 mb-6 overflow-x-auto hide-scrollbar'>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1 px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'profile'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-foreground/50 hover:text-foreground/80'
          }`}
        >
          <FiUser className='w-4 h-4' />
          <span>Profile</span>
        </button>

        <button
          className={classNames(
            'flex items-center gap-1 px-4 py-2 border-b-2 font-medium transition-colors',
            activeTab === 'privacy'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-foreground/50 hover:text-foreground/80',
          )}
          onClick={() => setActiveTab('privacy')}
        >
          <FiShield className='w-4 h-4' />
          <span>Privacy</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className='bg-background rounded-lg flex-1 overflow-y-auto'>
        <div className='p-6'>{renderTabContent()}</div>
      </div>
    </div>
  )
}

Settings.PageLayout = function SettingsLayout({ children }) {
  const GrandfatherLayout =
    DashboardLayout.PageLayout ?? (({ children }) => children)
  return (
    <GrandfatherLayout>
      <DashboardLayout>{children}</DashboardLayout>
    </GrandfatherLayout>
  )
}

export default Settings
