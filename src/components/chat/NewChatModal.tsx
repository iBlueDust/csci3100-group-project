import React, { useCallback, useState } from 'react'
import SubmitButton from '../form/SubmitButton'
import Input from '../form/Input'

export interface NewChatModalProps {
  onConfirm?: (recipient: string) => void
  onCancel?: () => void
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onConfirm, onCancel }) => {
  const [recipient, setRecipient] = useState<string>('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onConfirm?.(recipient)
    },
    [recipient, onConfirm],
  )

  const handleCancel = useCallback(() => {
    setRecipient('')
    onCancel?.()
  }, [onCancel])

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <form
        className='bg-background border-2 border-foreground/10 rounded-lg p-6 max-w-md w-full mx-4'
        onSubmit={handleSubmit}
      >
        <h3 className='text-xl font-bold mb-4'>Start a New Conversation</h3>

        <Input
          type='text'
          label='Username'
          placeholder='Enter username'
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />

        <div className='flex justify-end gap-2'>
          <SubmitButton
            className='px-4 py-2 border-2 border-foreground/10 rounded-md hover:bg-foreground/5'
            type='button'
            onClick={handleCancel}
          >
            Cancel
          </SubmitButton>
          <SubmitButton
            type='submit'
            look='primary'
            onClick={() => onConfirm?.(recipient)}
            disabled={!recipient.trim()}
          >
            Start Conversation
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}

export default NewChatModal
