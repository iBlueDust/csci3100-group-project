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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <form
        className='mx-4 w-full max-w-md rounded-lg border-2 border-foreground/10 bg-background p-6'
        onSubmit={handleSubmit}
      >
        <h3 className='mb-4 text-xl font-bold'>Start a New Conversation</h3>

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
            className='rounded-md border-2 border-foreground/10 px-4 py-2 hover:bg-foreground/5'
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
