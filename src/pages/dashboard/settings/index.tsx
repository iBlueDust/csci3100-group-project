import React from 'react'

import SubmitButton from '@/components/form/SubmitButton'
import Input from '@/components/form/Input'
import TextArea from '@/components/form/TextArea'
import { PageWithLayout } from '@/data/types/layout'
import SettingsLayout from '@/layouts/SettingsLayout'
import { useApi } from '@/utils/frontend/api'

const SettingsProfilePage: PageWithLayout = () => {
  const api = useApi()

  return (
    <section className='space-y-6'>
      <div className='flex flex-col items-start gap-8 md:flex-row'>
        <div className='flex size-32 items-center justify-center rounded-full bg-foreground/10 text-4xl'>
          {api.user?.username.charAt(0).toUpperCase()}
        </div>

        <div className='flex-1'>
          <h3 className='mb-1 text-xl font-bold'>Profile Picture</h3>
          <p className='mb-4 text-foreground/70'>
            Upload a photo to personalize your account
          </p>

          <div className='flex gap-3'>
            <button className='button-primary px-4 py-1'>Upload</button>
            <button className='button px-4 py-1'>Remove</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className='mb-4 text-xl font-bold'>Personal Information</h3>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <Input type='email' name='email' label='Email' />

          <Input type='text' name='username' label='Username' />

          <Input type='text' id='location' name='location' label='Location' />

          <Input type='url' name='website' label='Website' />

          <div className='md:col-span-2'>
            <TextArea label='Bio' name='bio' rows={4} />
          </div>
        </div>

        <SubmitButton look='primary' className='ml-auto mt-6 block px-4 py-2'>
          Save Changes
        </SubmitButton>
      </div>
    </section>
  )
}

SettingsProfilePage.getLayout = (page) => {
  const GrandfatherLayout = SettingsLayout.getLayout ?? ((page) => page)
  return GrandfatherLayout(<SettingsLayout>{page}</SettingsLayout>)
}

export default SettingsProfilePage
