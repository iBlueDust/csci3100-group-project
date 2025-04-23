import React from 'react'

import SubmitButton from '@/components/SubmitButton'
import Input from '@/components/Input'
import TextArea from '@/components/TextArea'
import { PageWithLayout } from '@/data/types/layout'
import SettingsLayout from '@/layouts/SettingsLayout'
import { useApi } from '@/utils/frontend/api'

const SettingsProfilePage: PageWithLayout = () => {
  const api = useApi()

  return (
    <section className='space-y-6'>
      <div className='flex flex-col md:flex-row gap-8 items-start'>
        <div className='w-32 h-32 rounded-full bg-foreground/10 flex items-center justify-center text-4xl'>
          {api.user?.username.charAt(0).toUpperCase()}
        </div>

        <div className='flex-1'>
          <h3 className='text-xl font-bold mb-1'>Profile Picture</h3>
          <p className='text-foreground/70 mb-4'>
            Upload a photo to personalize your account
          </p>

          <div className='flex gap-3'>
            <button className='button-primary py-1 px-4'>Upload</button>
            <button className='button py-1 px-4'>Remove</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className='text-xl font-bold mb-4'>Personal Information</h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Input type='email' name='email' label='Email' />

          <Input type='text' name='username' label='Username' />

          <Input type='text' id='location' name='location' label='Location' />

          <Input type='url' name='website' label='Website' />

          <div className='md:col-span-2'>
            <TextArea label='Bio' name='bio' rows={4} />
          </div>
        </div>

        <SubmitButton look='primary' className='mt-6 ml-auto block px-4 py-2'>
          Save Changes
        </SubmitButton>
      </div>
    </section>
  )
}

SettingsProfilePage.PageLayout = function SettingsProfilePageLayout({
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

export default SettingsProfilePage
