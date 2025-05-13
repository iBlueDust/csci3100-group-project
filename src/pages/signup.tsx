import Link from 'next/link'
import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import Joi from 'joi'
import { FiInfo } from 'react-icons/fi'

import { geistMono, geistSans } from '@/styles/fonts'
import Input from '@/components/form/Input'
import SubmitButton from '@/components/form/SubmitButton'
import { PageWithLayout } from '@/types/layout'
import { SignUpError, SignUpErrorType, useSignUp } from '@/hooks/useSignUp'
import { ApiProvider, useApi } from '@/hooks/useApi'

const formSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9.-]+$/)
    .min(1)
    .max(64)
    .required()
    .messages({
      'string.min': 'Username must be at least 1 character long',
      'string.max': 'Username must be at most 64 characters long',
      'string.pattern.name': 'Username must be alphanumeric',
      'string.empty': 'Username is required',
      'any.required': 'Username is required',
    }),
  licenseKey: Joi.string()
    .pattern(/^(?:[A-HJ-NP-Z2-9]{4}-){3}[A-HJ-NP-Z2-9]{4}$/)
    .required()
    .messages({
      'string.pattern.name':
        'License key must be in the format XXXX-XXXX-XXXX-XXXX',
      'string.empty': 'License key is required',
      'any.required': 'License key is required',
    }),
  password: Joi.string()
    .pattern(/^[!-~]+$/) // ascii readable
    .min(12)
    .max(64)
    .custom((value, helpers) => {
      if (!/[A-Z]/.test(value)) {
        // no uppercase letters
        throw helpers.error('password.uppercase')
      } else if (!/[a-z]/.test(value)) {
        // no lowercase letters
        throw helpers.error('password.lowercase')
      } else if (!/[0-9]/.test(value)) {
        // no digits
        throw helpers.error('password.digit')
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        // no special characters
        throw helpers.error('password.special')
      }
      return value
    })
    .required()
    .messages({
      'string.pattern.name':
        'Password must be composed of English letters, numbers, and symbols',
      'string.min': 'Password must be at least 12 characters long',
      'string.max': 'Password must be at most 64 characters long',
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
      'password.uppercase':
        'Password must contain a lowercase letter, uppercase letter, digit, and symbol',
      'password.lowercase':
        'Password must contain a lowercase letter, uppercase letter, digit, and symbol',
      'password.digit':
        'Password must contain a lowercase letter, uppercase letter, digit, and symbol',
      'password.special':
        'Password must contain a lowercase letter, uppercase letter, digit, and symbol',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'string.empty': 'Confirm password is required',
    'any.required': 'Confirm password is required',
  }),
})

const SignUp: PageWithLayout = () => {
  const router = useRouter()
  const api = useApi()

  const [formErrors, setFormErrors] = useState<{
    general?: string
    username?: string
    email?: string
    licenseKey?: string
    password?: string
    confirmPassword?: string
  }>({})

  const { signUp, isLoading } = useSignUp({
    api,
    onSuccess: () => {
      router.push('/dashboard')
    },
    onError: (error) => {
      if (
        error instanceof SignUpError &&
        error.type === SignUpErrorType.UsernameTaken
      ) {
        setFormErrors((prev) => ({
          ...prev,
          username: 'Username is already taken',
        }))
        return
      }

      console.error('Error signing up:', error)
      setFormErrors((prev) => ({
        ...prev,
        general: 'An unexpected error occurred',
      }))
    },
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      setFormErrors({})

      const formData = new FormData(e.target as HTMLFormElement)

      const unvalidatedData = {
        username: formData.get('username') as string,
        licenseKey: formData.get('licenseKey') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
      }

      const { value: data, error } = formSchema.validate(unvalidatedData, {
        abortEarly: false,
      })

      if (error) {
        error.details.forEach((detail) => {
          const field = detail.path[0]
          const message = detail.message

          setFormErrors((prev) => ({
            ...prev,
            [field]: message,
          }))
        })
        return
      }

      await signUp(data).catch(() => {}) // error handled in useSignUp
    },
    [signUp],
  )

  return (
    <div
      className={classNames(
        geistSans.variable,
        geistMono.variable,
        'grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-body',
      )}
    >
      <main className='row-start-2 flex w-full max-w-md flex-col items-center gap-8'>
        <h1 className='border-b border-foreground font-mono text-4xl font-bold'>
          Sign Up
        </h1>

        <form
          className='w-full space-y-4'
          autoComplete='off'
          onSubmit={handleSubmit}
        >
          <Input
            type='text'
            name='username'
            label='Username'
            autoComplete='username'
            error={formErrors.username}
            required
          />
          <Input
            type='password'
            name='password'
            label='Password'
            autoComplete='new-password'
            error={formErrors.password}
            required
          />
          <Input
            type='password'
            name='confirmPassword'
            label='Confirm Password'
            autoComplete='new-password'
            error={formErrors.confirmPassword}
            required
          />

          <hr className='mx-2 border-foreground-light/50 pb-2' />

          <Input
            type='text'
            name='licenseKey'
            label={
              <>
                License Key
                <FiInfo
                  className='ml-1 inline-block size-4 cursor-pointer text-foreground-light'
                  title='You need a valid Jade Trail license key'
                />
              </>
            }
            autoComplete='off'
            inputMode='text'
            error={formErrors.licenseKey}
            placeholder='XXXX-XXXX-XXXX-XXXX'
            pattern='(?:[A-HJ-NP-Z2-9]{4}-){3}[A-HJ-NP-Z2-9]{4}'
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
              Create Account
            </SubmitButton>
          </div>
        </form>

        <div className='pt-2 text-center'>
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

SignUp.getLayout = (page) => {
  return <ApiProvider>{page}</ApiProvider>
}

export default SignUp
