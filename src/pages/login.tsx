import Link from 'next/link'
import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { useRouter } from 'next/router'

import { geistMono, geistSans } from '@/styles/fonts'
import Input from '@/components/form/Input'
import SubmitButton from '@/components/form/SubmitButton'
import { LoginError, LoginErrorType, useLogin } from '@/hooks/useLogin'
import { PageWithLayout } from '@/data/types/layout'
import { ApiProvider, useApi } from '@/utils/frontend/api'

const Login: PageWithLayout = () => {
  const router = useRouter()
  const api = useApi()

  const [formErrors, setFormErrors] = useState<{
    general?: string
    username?: string
    password?: string
  }>({})

  const { login, isLoading } = useLogin({
    api,
    onSuccess: () => {
      router.push('/dashboard')
    },
    onError: (error) => {
      if (error instanceof LoginError) {
        if (error.type === LoginErrorType.UserNotFound) {
          setFormErrors((prev) => ({
            ...prev,
            username: 'Username not found',
          }))
        } else if (error.type === LoginErrorType.InvalidCredentials) {
          setFormErrors((prev) => ({
            ...prev,
            password: 'Invalid password',
          }))
        }
        return
      }

      console.error('Login error:', error)
      setFormErrors((prev) => ({
        ...prev,
        general: 'An unexpected error occurred, please try again later',
      }))
    },
  })

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
        return
      }

      await login(data).catch(() => {}) // error handled in useLogin
    },
    [login],
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
          <Input
            type='text'
            name='username'
            label='Username'
            error={formErrors.username}
            required
          />
          <Input
            type='password'
            name='password'
            label='Password'
            error={formErrors.password}
            required
          />

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
