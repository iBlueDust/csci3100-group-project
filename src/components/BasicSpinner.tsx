import classNames from 'classnames'
import React from 'react'
import { CgSpinner } from 'react-icons/cg'

export interface BasicSpinnerProps {
  className?: string
}

const BasicSpinner: React.FC<BasicSpinnerProps> = ({ className }) => {
  return <CgSpinner className={classNames('animate-spin', className)} />
}

export default BasicSpinner
