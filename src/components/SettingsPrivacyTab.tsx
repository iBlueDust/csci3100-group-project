import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { useApi } from '@/utils/frontend/api'

const DeleteAccountModal = dynamic(() => import('./DeleteAccountModal'))

export type SettingsPrivacyTabProps = object

const SettingsPrivacyTab: React.FC<SettingsPrivacyTabProps> = ({}) => {
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

export default SettingsPrivacyTab
