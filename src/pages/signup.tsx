import Link from 'next/link'
import { useState } from 'react'
import classNames from 'classnames'
import { geistMono, geistSans } from '@/styles/fonts'

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add your signup logic here
    console.log('Signup form submitted:', formData)
  }

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
          <div>
            <label htmlFor="username" className="block text-sm font-medium">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          
          <div className="pt-4">
            <button type="submit" className="button-primary w-full">
              Create Account
            </button>
          </div>
        </form>
        
        <div className="text-center pt-2">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="link">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}