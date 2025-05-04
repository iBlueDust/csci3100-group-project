import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { FiPaperclip, FiSend, FiTrash2 } from 'react-icons/fi'
import Image from 'next/image'
import TextareaAutosize from 'react-textarea-autosize'
import { formatCurrency } from '@/utils/format'

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
      console.log({ attachment })
      const sendSuccess = await onSend(messageInput, attachment)
      if (!sendSuccess) {
        return
      }
    }

    if (!attachment) {
      setMessageInput('')
    }
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
    <div className='border-t-2 border-foreground/10 bg-background p-2 md:p-4'>
      {/* Attachment preview */}
      {showAttachmentPreview && attachment && (
        <div className='mb-2 flex items-center justify-between rounded-lg border-2 border-foreground/10 bg-background-dark/10 p-2'>
          <div className='flex items-center gap-2'>
            <div className='rounded-lg bg-foreground/5 p-2'>
              <FiPaperclip size={18} />
            </div>
            <div>
              <p className='truncate text-sm'>{attachment.name}</p>
              <p className='text-xs text-foreground/70'>
                {(attachment.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={cancelAttachment}
            className='text-foreground/70 transition-colors hover:text-red-500'
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )}

      <div className='group mb-2 flex items-stretch gap-4 rounded-lg border-2 border-foreground/10 bg-background-dark/10'>
        <Image
          src='http://ec2-13-229-119-2.ap-southeast-1.compute.amazonaws.com:9000/market-listing-attachments/aa3fe78b-6a4a-4f2f-99e5-a72e51354366.jpg'
          alt='Attachment preview: market listing picture'
          width={80}
          height={80}
          className='size-20 rounded-l-md bg-background-dark object-cover'
        />

        <div className='flex flex-1 flex-col flex-nowrap justify-between gap-2 py-2'>
          <div className='flex justify-between gap-2'>
            <div className='inline-block'>
              <p className='mb-1 truncate'>{'title goes here'}</p>
              <p className='line-clamp-2 text-xs text-foreground/70'>
                {
                  'Adipisicing nulla dolor ipsum proident pariatur ipsum in labore magna culpa. Commodo est cillum ex anim proident et exercitation do consectetur aute. In ut elit velit ut occaecat labore consequat fugiat enim sit tempor.'
                }
              </p>
            </div>
            <p className='text-right md:font-bold'>{formatCurrency(1000)}</p>
          </div>

          <div className='group:md:block hidden space-x-4 text-xs text-foreground-light'>
            <span>by {'seller'}</span>
            <span className='group:md:inline-block hidden text-xs'>
              ★ {0} ({0} reviews)
            </span>
            <span className='group:md:inline-block hidden'>{'Canada'}</span>
            <span>{'a day ago'}</span>
          </div>
        </div>

        <button
          onClick={cancelAttachment}
          className='mr-2 self-center text-foreground/70 transition-colors hover:text-red-500'
        >
          <FiTrash2 size={16} />
        </button>
      </div>

      <div className='flex items-center gap-2'>
        <form
          ref={formRef}
          className='flex w-full items-center gap-2'
          onSubmit={handleFormSubmit}
        >
          <TextareaAutosize
            ref={messageInputRef}
            name='message'
            className='max-h-40 min-h-10 flex-1 resize-none rounded-md border border-foreground/20 bg-background px-3 py-2'
            placeholder='Type a message...'
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            minRows={1}
            maxRows={10}
            cacheMeasurements
          />
          <label className='flex size-10 cursor-pointer items-center justify-center rounded-full bg-foreground/10 transition-colors hover:bg-foreground/20'>
            <FiPaperclip size={18} />
            <input
              type='file'
              onChange={handleAttachmentChange}
              className='hidden'
            />
          </label>
          <button
            type='submit'
            className='flex size-10 items-center justify-center rounded-full border-2 border-background-dark bg-foreground text-background disabled:opacity-50'
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
