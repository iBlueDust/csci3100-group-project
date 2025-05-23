import classNames from 'classnames'
import React from 'react'

import BasicSpinner from '@/components/BasicSpinner'

type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export interface SubmitButtonProps extends HTMLButtonProps {
  ref?: React.Ref<HTMLButtonElement>
  look?: 'primary' | 'error' | 'default'
  loading?: boolean
}

const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const look = props.look ?? 'default'

  const buttonProps = { ...props }
  delete buttonProps.look
  delete buttonProps.loading
  delete buttonProps.className
  delete buttonProps.children

  return (
    <button
      {...buttonProps}
      disabled={props.loading || props.disabled}
      className={classNames(
        look === 'primary' && 'button-primary',
        look === 'error' &&
          'button bg-red-500 text-white px-4 py-2 disabled:opacity-50',
        look === 'default' && 'button',
        props.className,
      )}
    >
      <span className='flex flex-row flex-nowrap items-center gap-2'>
        {props.loading && <BasicSpinner className='size-6' />}

        <span className='mt-0.5'>{props.children}</span>
      </span>
    </button>
  )
}

export default SubmitButton
