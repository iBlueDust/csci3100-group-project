import Link from 'next/link'
import { useState } from 'react'
import classNames from 'classnames'
import { geistMono, geistSans } from '@/styles/fonts'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would validate credentials here
    console.log('Login form submitted:', formData)
    
    // Redirect to dashboard after successful login
    window.location.href = '/dashboard'
    
    // Or using Next.js router (import { useRouter } from 'next/router' first)
    // const router = useRouter()
    // router.push('/dashboard')
  }

  return (
    <div
      className={classNames(
        geistSans.variable,
        geistMono.variable,
        'grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-4 pb-10 gap-8 sm:p-8 md:p-20 md:pb-20 md:gap-16 font-body',
      )}
    >
      <main className='flex flex-col gap-6 sm:gap-8 row-start-2 items-center w-full max-w-md'>
        <h1 className='text-4xl font-bold border-b-2 border-foreground font-mono text-center'>
          Log In
        </h1>
        
        <form onSubmit={handleSubmit} className='w-full space-y-4'>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 px-3 py-2"
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
              className="mt-1 block w-full rounded-md border-2 border-gray-300 px-3 py-2"
              required
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-2 border-gray-300"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link href="/forgot-password" className="link">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <div className="pt-4">
            <button type="submit" className="button-primary w-full">
              Log In
            </button>
          </div>
        </form>
        
        <div className="text-center pt-2">
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="link">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}