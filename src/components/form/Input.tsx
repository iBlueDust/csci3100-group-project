import React from 'react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
  error?: string
  hideError?: boolean
}

const Input: React.FC<InputProps> = (props) => {
  return (
    <div className='text-sm font-medium'>
      <label className='mb-1 block'>
        <span>{props.label}</span>

        <input
          className='mt-1 block w-full rounded-md border bg-background-light border-foreground-light/75 px-3 py-2'
          {...props}
        />
      </label>

      {!props.hideError && (
        <div className='mx-1 text-red-500 min-h-5'>{props.error}</div>
      )}
    </div>
  )
}

export default Input
