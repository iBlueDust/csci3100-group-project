import React from 'react'

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode
  error?: string
}

const TextArea: React.FC<TextAreaProps> = (props) => {
  return (
    <div className='text-sm font-medium'>
      <label className='mb-1 block'>
        <span>{props.label}</span>

        <textarea
          className='mt-1 block w-full rounded-md border border-foreground-light/75 bg-background-light px-3 py-2'
          {...props}
        />
      </label>

      <div className='mx-1 min-h-5 text-red-500'>{props.error}</div>
    </div>
  )
}

export default TextArea
