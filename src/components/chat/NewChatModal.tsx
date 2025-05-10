import React, { useCallback, useState } from 'react'

import SubmitButton from '@/components/form/SubmitButton'
import Input from '@/components/form/Input'
import { createNewChatByUsername } from '@/data/frontend/mutations/createNewChatByUsername'
import { useApi } from '@/utils/frontend/api'

export interface NewChatModalProps {
  onSubmit?: (recipient: string) => void
  onConfirm?: (recipient: string, chatId: string) => void
  onCancel?: () => void
}

const NewChatModal: React.FC<NewChatModalProps> = ({
  onSubmit,
  onConfirm,
  onCancel,
}) => {
  const api = useApi()
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value),
    [],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const username = formData.get('username') as string
      onSubmit?.(username)

      if (!username.trim()) {
        return
      }

      setIsLoading(true)

      let result: Awaited<ReturnType<typeof createNewChatByUsername>>
      try {
        result = await createNewChatByUsername(api, username)
      } catch (error) {
        console.error('Failed to create new chat', error)
        setError('Failed to create new chat')
        return
      } finally {
        setIsLoading(false)
      }

      if (result.alreadyExists) {
        setError('Chat already exists')
        return
      }

      const chatId = result.id
      onConfirm?.(username, chatId)
      setUsername('')
    },
    [api, onSubmit, onConfirm],
  )

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <form
        className='bg-background border-2 border-foreground/10 rounded-lg p-6 max-w-md w-full mx-4'
        onSubmit={handleSubmit}
      >
        <h3 className='text-xl font-bold mb-4'>Start a New Conversation</h3>

        <div className='mb-2'>
          <Input
            type='text'
            name='username'
            label='Username'
            placeholder='Enter username'
            value={username}
            onChange={handleChange}
            error={error}
          />
        </div>

        <div className='flex justify-end gap-2'>
          <SubmitButton
            className='px-4 py-2 border-2 border-foreground/10 rounded-md hover:bg-foreground/5'
            type='reset'
            disabled={isLoading}
            onClick={onCancel}
          >
            Cancel
          </SubmitButton>
          <SubmitButton
            type='submit'
            look='primary'
            loading={isLoading}
            disabled={!username.trim()}
          >
            Start Conversation
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}

export default NewChatModal
