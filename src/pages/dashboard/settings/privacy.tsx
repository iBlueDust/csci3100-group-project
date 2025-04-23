import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { useApi } from '@/utils/frontend/api'
import { PageWithLayout } from '@/data/types/layout'
import SettingsLayout from '@/layouts/SettingsLayout'

const DeleteAccountModal = dynamic(
  () => import('../../../components/DeleteAccountModal'),
)

const SettingsPrivacyPage: PageWithLayout = () => {
  const api = useApi()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <section className='space-y-6'>
      <button className='button mb-2 w-full justify-start text-left'>
        View Privacy Policy
      </button>
      <button className='button mb-2 w-full justify-start text-left'>
        Manage Cookies
      </button>
      <button
        onClick={() => setShowDeleteModal(true)}
        className='button text-red-500 w-full justify-start text-left'
      >
        Delete Account
      </button>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && api.user && (
        <DeleteAccountModal
          username={api.user.username}
          onClose={() => setShowDeleteModal(false)}
          onConfirmSuccess={async () => {
            // do stuff
          }}
        />
      )}
    </section>
  )
}

SettingsPrivacyPage.PageLayout = function SettingsPrivacyPageLayout({
  children,
}) {
  const GrandfatherLayout =
    SettingsLayout.PageLayout ?? (({ children }) => children)
  return (
    <GrandfatherLayout>
      <SettingsLayout>{children}</SettingsLayout>
    </GrandfatherLayout>
  )
}

export default SettingsPrivacyPage
