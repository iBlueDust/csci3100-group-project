import Link from 'next/link'
import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { useRouter } from 'next/router'

import { geistMono, geistSans } from '@/styles/fonts'
import Input from '@/components/form/Input'
import SubmitButton from '@/components/form/SubmitButton'
import { toPasskey } from '@/utils/frontend/e2e/auth'
import { ApiProvider, useApi } from '@/utils/frontend/api'
import { PageWithLayout } from '@/data/types/layout'
import { decryptUserEncryptionKey, importKey } from '@/utils/frontend/e2e'
import { generateDeterministicSymmetricKey } from '@/utils/frontend/e2e/kdf'
import env from '@/utils/frontend/env'
import { base642ab } from '@/utils'

const Login: PageWithLayout = () => {
  const router = useRouter()
  const api = useApi()

  const [isLoading, setIsLoading] = useState(false)

  const [formErrors, setFormErrors] = useState<{
    general?: string
    username?: string
    password?: string
  }>({})

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      setFormErrors({})

      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        username: formData.get('username') as string,
        password: formData.get('password') as string,
      }

      let isValid = true

      if (!data.username) {
        setFormErrors((prev) => ({
          ...prev,
          username: 'Username is required',
        }))
        isValid = false
      }

      if (!data.password) {
        setFormErrors((prev) => ({
          ...prev,
          password: 'Password is required',
        }))
        isValid = false
      }

      if (!isValid) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const payload = {
          username: data.username,
          passkey: await toPasskey(data.username, data.password),
        }

        const response = await api.fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (response.status === 401) {
          // 401 Unauthorized
          setFormErrors((prev) => ({
            ...prev,
            general: 'Invalid username or password',
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

        const uekDecryptionKey = await generateDeterministicSymmetricKey(
          `${data.username}:${data.password}`,
          env.NEXT_PUBLIC_UEK_DERIVATION_SALT,
          ['decrypt'],
        )

        const encryptedUekBuffer = base642ab(body.encryptedUserEncryptionKey)
        const uekPrivate = await decryptUserEncryptionKey(
          encryptedUekBuffer,
          uekDecryptionKey,
        )
        const uekPublic = await importKey(body.publicKey, 'jwk', [])

        api.setUek({ privateKey: uekPrivate, publicKey: uekPublic })
        api.setUser({
          id: body.id,
          username: data.username,
        })
        api.setTokenExpiresAt(new Date(body.expiresAt))

        router.push('/dashboard')
      } catch (error) {

        setFormErrors((prev) => ({
          ...prev,
          general: 'Invalid username or password',
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
        'grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-4 pb-10 gap-8 sm:p-8 md:p-20 md:pb-20 md:gap-16 font-body',
      )}
    >
      <main className='row-start-2 flex w-full max-w-md flex-col items-center gap-6 sm:gap-8'>
        <h1 className='border-b-2 border-foreground text-center font-mono text-4xl font-bold'>
          Log In
        </h1>

        <form onSubmit={handleSubmit} className='w-full space-y-4'>
          <Input type='text' name='username' label='Username' required />
          <Input type='password' name='password' label='Password' required />

          {formErrors.general && (
            <p className='mx-auto max-w-96 text-center text-sm text-red-500'>
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
              Log In
            </SubmitButton>
          </div>
        </form>

        <div className='pt-2 text-center'>
          <p>
            Don&apos;t have an account?{' '}
            <Link href='/signup' className='link underline underline-offset-4'>
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

Login.getLayout = (page) => {
  return <ApiProvider>{page}</ApiProvider>
}

export default Login
