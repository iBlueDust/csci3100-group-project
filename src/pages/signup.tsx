import Link from 'next/link'
import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { useRouter } from 'next/router'

import { geistMono, geistSans } from '@/styles/fonts'
import Input from '@/components/Input'
import SubmitButton from '@/components/SubmitButton'
import { toPasskey } from '@/utils/frontend/e2e/auth'
import { ApiProvider, useApi } from '@/utils/frontend/api'
import { PageWithLayout } from '@/data/types/layout'
import { exportKey, generateUserEncryptionKey } from '@/utils/frontend/e2e'
import { isDev } from '@/utils/frontend/env'

const SignUp: PageWithLayout = () => {
  const router = useRouter()
  const api = useApi()

  const [isLoading, setIsLoading] = useState(false)

  const [formErrors, setFormErrors] = useState<{
    general?: string
    username?: string
    email?: string
    licenseKey?: string
    password?: string
    confirmPassword?: string
  }>({})

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      setFormErrors({})

      const formData = new FormData(e.target as HTMLFormElement)

      const data = {
        username: formData.get('username') as string,
        licenseKey: formData.get('licenseKey') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
      }

      let isValid = true

      if (!/^[a-zA-Z0-9.-]{1,64}$/.test(data.username)) {
        setFormErrors((prev) => ({
          ...prev,
          username: 'Username must be alphanumeric and between 1-64 characters',
        }))
        isValid = false
      }

      if (
        /^(?:[A-HJ-NP-Z2-9]{4}-){3}[A-HJ-NP-Z2-9]{4}$/.test(data.licenseKey)
      ) {
        setFormErrors((prev) => ({
          ...prev,
          licenseKey: 'License key must be in the format XXXX-XXXX-XXXX-XXXX',
        }))
        isValid = false
      }

      // password must be ascii readable
      if (!/^[!-~]+$/.test(data.password)) {
        setFormErrors((prev) => ({
          ...prev,
          password:
            'Password must compose of English letters, numbers, and symbols',
        }))
        isValid = false
      } else if (data.password.length < 12 || data.password.length > 64) {
        setFormErrors((prev) => ({
          ...prev,
          password:
            'Password must be 12-64 characters long and contain an uppercase letter, a lowercase letter, a number, and a symbol',
        }))
        isValid = false
      } else if (!/[A-Z]/.test(data.password)) {
        setFormErrors((prev) => ({
          ...prev,
          password: 'Password must contain at least one uppercase letter',
        }))
        isValid = false
      } else if (!/[a-z]/.test(data.password)) {
        setFormErrors((prev) => ({
          ...prev,
          password: 'Password must contain at least one lowercase letter',
        }))
        isValid = false
      } else if (!/[0-9]/.test(data.password)) {
        setFormErrors((prev) => ({
          ...prev,
          password: 'Password must contain at least one number',
        }))
        isValid = false
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
        setFormErrors((prev) => ({
          ...prev,
          password: 'Password must contain at least one special character',
        }))
        isValid = false
      }

      if (data.password !== data.confirmPassword) {
        setFormErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match',
        }))
        isValid = false
      }

      if (!isValid) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const uek = await generateUserEncryptionKey(
          data.username,
          data.password,
        )
        const jwk = await exportKey(uek.publicKey)
        api.setUek(uek)

        const payload = {
          username: data.username,
          passkey: await toPasskey(data.username, data.password),
          publicKey: jwk,
          licenseKey: data.licenseKey,
        }

        const response = await api.fetch('/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (response.status === 409) {
          // 409 Conflict
          setFormErrors((prev) => ({
            ...prev,
            username: 'Username is already taken',
          }))
          return
        }

        if (!response.ok) {
          setFormErrors((prev) => ({
            ...prev,
            general: 'An unexpected error occurred',
          }))
          return
        }

        const body = await response.json()
        console.log('Logged in as user', body.id)

        api.setUser({
          id: body.id,
          username: data.username,
        })
        api.setTokenExpiresAt(new Date(body.expiresAt))

        router.push('/dashboard')
      } catch (error) {
        console.error('Error signing up:', error)
        setFormErrors((prev) => ({
          ...prev,
          general: 'An unexpected error occurred',
        }))
      } finally {
        setIsLoading(false)
      }
    },
    [router, api],
  )

  return (
    <div
      className={classNames(
        geistSans.variable,
        geistMono.variable,
        'grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-body',
      )}
    >
      <main className='flex flex-col gap-8 row-start-2 items-center w-full max-w-md'>
        <h1 className='text-4xl font-bold border-b border-foreground font-mono'>
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className='w-full space-y-4'>
          <Input
            type='text'
            name='username'
            label='Username'
            autoComplete='off'
            error={formErrors.username}
            required
          />

          <Input
            type='text'
            name='licenseKey'
            label='Password'
            autoComplete={isDev ? undefined : 'off'}
            error={formErrors.licenseKey}
            placeholder='XXXX-XXXX-XXXX-XXXX'
            pattern='(?:[A-HJ-NP-Z2-9]{4}-){3}[A-HJ-NP-Z2-9]{4}'
            required
          />

          <Input
            type='password'
            name='password'
            label='Password'
            autoComplete={isDev ? undefined : 'new-password'}
            error={formErrors.password}
            required
          />

          <Input
            type='password'
            name='confirmPassword'
            label='Confirm Password'
            autoComplete={isDev ? undefined : 'new-password'}
            error={formErrors.confirmPassword}
            required
          />

          {formErrors.general && (
            <p className='text-red-500 text-center max-w-96 mx-auto text-sm'>
              {formErrors.general}
            </p>
          )}

          <div className='pt-4'>
            <SubmitButton
              look='primary'
              type='submit'
              className='w-full'
              loading={isLoading}
            >
              Create Account
            </SubmitButton>
          </div>
        </form>

        <div className='text-center pt-2'>
          <p>
            Already have an account?{' '}
            <Link href='/login' className='link underline underline-offset-4'>
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

SignUp.PageLayout = function SignUpLayout({ children }) {
  return <ApiProvider>{children}</ApiProvider>
}

export default SignUp
