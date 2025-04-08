import classNames from 'classnames'
import React from 'react'

import BasicSpinner from '@/components/BasicSpinner'

type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export interface SubmitButtonProps extends HTMLButtonProps {
  look?: 'primary' | 'default'
  loading?: boolean
}

const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const look = props.look ?? 'default'

  return (
    <button
      {...props}
      disabled={props.loading || props.disabled}
      className={classNames(
        look === 'primary' ? 'button-primary' : 'button',
        props.className,
      )}
    >
      <span className='flex flex-row flex-nowrap items-center gap-2'>
        {props.loading && <BasicSpinner className='w-6 h-6' />}

        <span className='mt-0.5'>{props.children}</span>
      </span>
    </button>
  )
}

export default SubmitButton
