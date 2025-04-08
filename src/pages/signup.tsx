import Link from 'next/link'
import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { geistMono, geistSans } from '@/styles/fonts'
import Input from '@/components/Input'

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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
      // Add your signup logic here
      console.log('Signup form submitted:', formData)
    },
    [formData],
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
            value={formData.username}
            onChange={handleChange}
            required
          />

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

          <Input
            type='password'
            name='confirmPassword'
            label='Confirm Password'
            value={formData.confirmPassword}
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
