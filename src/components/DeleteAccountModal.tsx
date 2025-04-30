import React, { useState } from 'react'
import SubmitButton from './form/SubmitButton'
import Input from './form/Input'

export interface DeleteAccountModalProps {
  username: string
  error?: string | undefined
  onClose?: () => void
  onConfirmSuccess?: () => void
  onConfirmFailure?: () => void
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  username,
  error,
  onClose,
  onConfirmSuccess,
  onConfirmFailure,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [confirmError, setConfirmError] = useState<string | undefined>(
    undefined,
  )

  return (
    <div className='fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <form className='bg-background rounded-lg max-w-md w-full p-6 border-2 border-foreground/10'>
        <h3 className='text-xl font-bold text-red-500 mb-2'>Delete Account</h3>
        <p className='text-foreground/70 mb-4'>
          This action cannot be undone. All of your data, including profile
          information, listings, and messages will be permanently deleted.
        </p>

        <Input
          type='text'
          placeholder={`Type "${username}" to confirm`}
          label={
            <>
              To confirm, type &ldquo;<b>{username}</b>&rdquo; below:
            </>
          }
          value={deleteConfirmation}
          error={confirmError}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
        />

        {true && <p className='text-red-500 text-center'>{error}</p>}

        <div className='flex gap-3 justify-end'>
          <SubmitButton
            type='button'
            className='button px-4 py-2'
            onClick={onClose}
          >
            Cancel
          </SubmitButton>
          <SubmitButton
            look='error'
            className='button bg-red-500 text-white px-4 py-2 disabled:opacity-50'
            disabled={deleteConfirmation !== username}
            onClick={() => {
              if (deleteConfirmation !== username) {
                onConfirmFailure?.()
                setConfirmError('Confirmation does not match username')
                return
              }

              setDeleteConfirmation('')
              setConfirmError(undefined)
              onConfirmSuccess?.()
            }}
          >
            Permanently Delete Account
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}

export default DeleteAccountModal
