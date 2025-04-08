import Link from 'next/link'
import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { useRouter } from 'next/router'

import { geistMono, geistSans } from '@/styles/fonts'
import Input from '@/components/Input'

export default function Login() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      // In a real app, you would validate credentials here
      console.log('Login form submitted:', formData)

      router.replace('/dashboard')

      // Or using Next.js router (import { useRouter } from 'next/router' first)
      // const router = useRouter()
      // router.push('/dashboard')
    },
    [router],
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
          Log In
        </h1>

        <form onSubmit={handleSubmit} className='w-full space-y-4'>
          <Input
            type='email'
            name='email'
            label='Email'
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            type='password'
            name='password'
            label='Password'
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className='flex items-center justify-between'>
            <label className='flex flex-row items-center'>
              <input
                name='remember-me'
                type='checkbox'
                className='h-4 w-4 rounded border-gray-300'
              />
              <span className='ml-2 text-sm'>Remember me</span>
            </label>

            {/* <Link href='/forgot-password' className='link underline text-sm'>
              Forgot your password?
            </Link> */}
          </div>

          <div className='pt-4'>
            <button type='submit' className='button-primary w-full'>
              Log In
            </button>
          </div>
        </form>

        <div className='text-center pt-2'>
          <p>
            Don&apos;t have an account?{' '}
            <Link href='/signup' className='link'>
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
