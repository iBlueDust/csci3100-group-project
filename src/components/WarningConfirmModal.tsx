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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-lg border-2 border-foreground/10 bg-background p-6 shadow-xl'>
        <div className='mb-4 flex items-center gap-3 text-red-500'>
          <FiAlertCircle size={24} />
          <h2 className='text-xl font-bold'>{title}</h2>
        </div>

        <p className='mb-4'>{children}</p>

        <div className='flex justify-end gap-3'>
          <SubmitButton onClick={onCancel}>Cancel</SubmitButton>
          <SubmitButton
            onClick={onConfirm}
            className='bg-red-500 text-white hover:border-red-800 hover:bg-red-600'
          >
            Delete Listing
          </SubmitButton>
        </div>
      </div>
    </div>
  )
}

export default WarningConfirmModal
