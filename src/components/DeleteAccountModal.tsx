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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm'>
      <form className='w-full max-w-md rounded-lg border-2 border-foreground/10 bg-background p-6'>
        <h3 className='mb-2 text-xl font-bold text-red-500'>Delete Account</h3>
        <p className='mb-4 text-foreground/70'>
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

        {true && <p className='text-center text-red-500'>{error}</p>}

        <div className='flex justify-end gap-3'>
          <SubmitButton
            type='button'
            className='button px-4 py-2'
            onClick={onClose}
          >
            Cancel
          </SubmitButton>
          <SubmitButton
            look='error'
            className='button bg-red-500 px-4 py-2 text-white disabled:opacity-50'
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
