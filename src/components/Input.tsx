import React from 'react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const Input: React.FC<InputProps> = (props) => {
  return (
    <label className='mb-1 block'>
      <span className='text-sm font-medium'>{props.label}</span>

      <input
        className='mt-1 block w-full rounded-md border bg-black border-gray-300 px-3 py-2'
        {...props}
      />
    </label>
  )
}

export default Input
