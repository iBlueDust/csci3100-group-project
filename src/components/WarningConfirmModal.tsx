import React from 'react'
import { FiAlertCircle } from 'react-icons/fi'
import SubmitButton from './form/SubmitButton'

export interface WarningConfirmModalProps {
  title: React.ReactNode
  children: React.ReactNode
  onConfirm?: () => void
  onCancel?: () => void
}

const WarningConfirmModal: React.FC<WarningConfirmModalProps> = ({
  title,
  children,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className='fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-background rounded-lg p-6 max-w-md w-full shadow-xl border-2 border-foreground/10'>
        <div className='flex items-center gap-3 mb-4 text-red-500'>
          <FiAlertCircle size={24} />
          <h2 className='text-xl font-bold'>{title}</h2>
        </div>

        <p className='mb-4'>{children}</p>

        <div className='flex gap-3 justify-end'>
          <SubmitButton onClick={onCancel}>Cancel</SubmitButton>
          <SubmitButton
            onClick={onConfirm}
            className='bg-red-500 bg-text-white hover:bg-red-600 hover:border-red-800'
          >
            Delete Listing
          </SubmitButton>
        </div>
      </div>
    </div>
  )
}

export default WarningConfirmModal
