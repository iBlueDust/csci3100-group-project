import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { FiPaperclip, FiSend } from 'react-icons/fi'
import dynamic from 'next/dynamic'
import classNames from 'classnames'
import TextareaAutosize from 'react-textarea-autosize'

import type { MarketListingSearchResult } from '@/data/api/mongo/queries/market'
const AttachmentSendPreview = dynamic(
  () => import('@/components/chat/AttachmentSendPreview'),
  { ssr: false },
)
const MarketListingSendPreview = dynamic(
  () => import('@/components/chat/MarketListingSendPreview'),
  { ssr: false },
)

export interface ChatInputProps {
  /**
   *
   * @param message Text message to send
   * @param attachment Attached file to send
   * @returns Whether the message was sent successfully or not. If successful,
   * the input will be cleared. If not, the input will NOT be cleared.
   */
  wasRequestedToDelete?: boolean
  onSend?: (
    message: string,
    attachment?:
      | { type: 'general'; value: File }
      | { type: 'market-listing'; value: MarketListingSearchResult },
  ) => Promise<boolean>
  initialPreviewMarketListing?: MarketListingSearchResult
}

const ChatInput: React.FC<ChatInputProps> = ({
  wasRequestedToDelete = false,
  onSend,
  initialPreviewMarketListing,
}) => {
  const [messageInput, setMessageInput] = useState('')
  const [attachment, setAttachment] = useState<
    | { type: 'general'; value: File }
    | { type: 'market-listing'; value: MarketListingSearchResult }
    | undefined
  >(() => {
    if (initialPreviewMarketListing) {
      return { type: 'market-listing', value: initialPreviewMarketListing }
    }

    return undefined
  })

  const formRef = useRef<HTMLFormElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  const handleAttachmentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !e.target.files[0]) {
        return
      }

      const file = e.target.files[0]
      setAttachment({ type: 'general', value: file })
    },
    [],
  )

  const cancelAttachment = useCallback(() => {
    setAttachment(undefined)
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (!onSend) {
      if (attachment) {
        setAttachment(undefined)
      } else {
        setMessageInput('')
      }
      return
    }

    if (attachment) {
      const sendSuccess = await onSend('', attachment)

      if (!sendSuccess) {
        return
      }
      setAttachment(undefined)
    } else {
      const sendSuccess = await onSend(messageInput)

      if (!sendSuccess) {
        return
      }
      setMessageInput('')
    }
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
      {attachment?.type === 'general' && (
        <AttachmentSendPreview
          name={attachment.value.name}
          size={attachment.value.size}
          onCancel={cancelAttachment}
        />
      )}

      {attachment?.type === 'market-listing' && (
        <MarketListingSendPreview
          listing={attachment.value}
          onCancel={cancelAttachment}
        />
      )}

      <div
        className={classNames(
          'flex items-center gap-2',
          wasRequestedToDelete && 'cursor-not-allowed',
        )}
        title={
          wasRequestedToDelete
            ? 'This chat has been deleted by the recipient, you cannot send anymore messages'
            : ''
        }
      >
        <form
          ref={formRef}
          className='flex w-full items-center gap-2'
          onSubmit={handleFormSubmit}
        >
          <TextareaAutosize
            ref={messageInputRef}
            name='message'
            className={classNames(
              'max-h-40 min-h-10 flex-1 resize-none rounded-md border border-foreground/20 bg-background px-3 py-2',
              wasRequestedToDelete && 'pointer-events-none opacity-50',
            )}
            placeholder='Type a message...'
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            minRows={1}
            maxRows={10}
            cacheMeasurements
            disabled={wasRequestedToDelete}
          />
          <label
            className={classNames(
              'flex size-10 cursor-pointer items-center justify-center rounded-full bg-foreground/10 transition-colors hover:bg-foreground/20',
              wasRequestedToDelete && 'pointer-events-none opacity-50',
            )}
          >
            <FiPaperclip size={18} />
            <input
              type='file'
              onChange={handleAttachmentChange}
              className='hidden'
              disabled={wasRequestedToDelete}
            />
          </label>
          <button
            type='submit'
            className='flex size-10 items-center justify-center rounded-full border-2 border-background-dark bg-foreground text-background disabled:opacity-50'
            disabled={
              wasRequestedToDelete || (!messageInput.trim() && !attachment)
            }
          >
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatInput
