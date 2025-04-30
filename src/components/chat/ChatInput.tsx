import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { FiPaperclip, FiSend, FiTrash2 } from 'react-icons/fi'
import TextareaAutosize from 'react-textarea-autosize'

export interface ChatInputProps {
  /**
   *
   * @param message Text message to send
   * @param attachment Attached file to send
   * @returns Whether the message was sent successfully or not. If successful,
   * the input will be cleared. If not, the input will NOT be cleared.
   */
  onSend?: (message: string, attachment: File | null) => Promise<boolean>
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [messageInput, setMessageInput] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  const handleAttachmentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !e.target.files[0]) {
        return
      }

      const file = e.target.files[0]
      setAttachment(file)
      setShowAttachmentPreview(true)
    },
    [],
  )

  const cancelAttachment = useCallback(() => {
    setAttachment(null)
    setShowAttachmentPreview(false)
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (onSend) {
      const sendSuccess = await onSend(messageInput, attachment)
      if (!sendSuccess) {
        return
      }
    }
    setMessageInput('')
    setAttachment(null)
    setShowAttachmentPreview(false)
  }, [onSend, messageInput, attachment])

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      await handleSendMessage()
    },
    [handleSendMessage],
  )

  useEffect(() => {
    if (!messageInputRef.current) {
      console.error('messageInputRef is not set')
      return
    }
    const elem = messageInputRef.current

    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
        return false
      }
    }
    elem.addEventListener('keydown', listener)

    return () => {
      elem.removeEventListener('keydown', listener)
    }
  }, [messageInputRef, formRef, handleSendMessage])

  useLayoutEffect(() => {
    messageInputRef.current?.focus()
  }, [messageInputRef])

  return (
    <div className='p-2 md:p-4 border-t-2 border-foreground/10 bg-background'>
      {/* Attachment preview */}
      {showAttachmentPreview && attachment && (
        <div className='mb-2 p-2 border-2 border-foreground/10 rounded-lg bg-background-dark/10 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='bg-foreground/5 p-2 rounded-lg'>
              <FiPaperclip size={18} />
            </div>
            <div>
              <p className='text-sm truncate'>{attachment.name}</p>
              <p className='text-xs text-foreground/70'>
                {(attachment.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={cancelAttachment}
            className='text-foreground/70 hover:text-red-500 transition-colors'
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )}

      <div className='flex items-center gap-2'>
        <form
          ref={formRef}
          className='flex w-full items-center gap-2'
          onSubmit={handleFormSubmit}
        >
          <TextareaAutosize
            ref={messageInputRef}
            name='message'
            className='flex-1 rounded-md border border-foreground/20 bg-background px-3 py-2 min-h-[2.5rem] max-h-[10rem] resize-none'
            placeholder='Type a message...'
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            minRows={1}
            maxRows={10}
            cacheMeasurements
          />
          <label className='h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center cursor-pointer hover:bg-foreground/20 transition-colors'>
            <FiPaperclip size={18} />
            <input
              type='file'
              onChange={handleAttachmentChange}
              className='hidden'
            />
          </label>
          <button
            type='submit'
            className='h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-50 border-2 border-background-dark'
            disabled={!messageInput.trim() && !attachment}
          >
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatInput
