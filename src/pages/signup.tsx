import Link from 'next/link'
import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { geistMono, geistSans } from '@/styles/fonts'
import Input from '@/components/Input'
import { toPasskey } from '@/utils/frontend/e2e/auth'

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [formErrors, setFormErrors] = useState<{
    general?: string
    username?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    setFormErrors({})

    const formData = new FormData(e.target as HTMLFormElement)

    const data = {
      username: formData.get('username') as string,
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
      return
    }

    const payload = {
      username: data.username,
      passkey: await toPasskey(data.username, data.password),
    }

    const response = await fetch(
      process.env.NEXT_PUBLIC_API_ENDPOINT + '/auth/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    )

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
  }, [])

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
            value={formData.username}
            error={formErrors.username}
            onChange={handleChange}
            required
          />

          <Input
            type='password'
            name='password'
            label='Password'
            value={formData.password}
            error={formErrors.password}
            onChange={handleChange}
            required
          />

          <Input
            type='password'
            name='confirmPassword'
            label='Confirm Password'
            value={formData.confirmPassword}
            error={formErrors.confirmPassword}
            onChange={handleChange}
            required
          />

          <div className='pt-4'>
            <button type='submit' className='button-primary w-full'>
              Create Account
            </button>
          </div>
        </form>

        <div className='text-center pt-2'>
          <p>
            Already have an account?{' '}
            <Link href='/login' className='link'>
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
