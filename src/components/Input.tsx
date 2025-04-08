import React from 'react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input: React.FC<InputProps> = (props) => {
  return (
    <div className='text-sm font-medium'>
      <label className='mb-1 block'>
        <span>{props.label}</span>

        <input
          className='mt-1 block w-full rounded-md border bg-black border-gray-300 px-3 py-2'
          {...props}
        />
      </label>

      <div className='text-red-500 min-h-5'>{props.error}</div>
    </div>
  )
}

export default Input
