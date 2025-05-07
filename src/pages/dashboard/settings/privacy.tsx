import React, { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import SettingsLayout from '@/layouts/SettingsLayout'
import { PageWithLayout } from '@/data/types/layout'
import { useApi } from '@/utils/frontend/api'
import { deleteMyAccount } from '@/data/frontend/mutations/deleteMyAccount'

const DeleteAccountModal = dynamic(
  () => import('@/components/DeleteAccountModal'),
)

const SettingsPrivacyPage: PageWithLayout = () => {
  const api = useApi()
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDeleteAccount = useCallback(async () => {
    let success = false
    try {
      success = await deleteMyAccount(api)
    } catch (error) {
      console.error('Failed to delete account', error)
      alert('Failed to delete account')
      return
    }

    if (success) {
      // Redirect to home page after account deletion
      router.push('/')
    } else {
      alert('Failed to delete account')
    }
  }, [api, router])

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
          onConfirmSuccess={handleDeleteAccount}
        />
      )}
    </section>
  )
}

SettingsPrivacyPage.getLayout = (page) => {
  const GrandfatherLayout = SettingsLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<SettingsLayout>{page}</SettingsLayout>)
}

export default SettingsPrivacyPage
