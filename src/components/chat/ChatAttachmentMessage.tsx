import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FiDownload, FiFile } from 'react-icons/fi'
import classNames from 'classnames'

import type { ClientAttachmentChatMessage } from '@/data/types/chats'
import BasicSpinner from '@/components/BasicSpinner'
import ChatMessage from '@/components/chat/ChatMessage'
import { str2ab, getExtension, extensionToMimeType } from '@/utils'
import { decryptMessage } from '@/utils/frontend/e2e'

export interface ChatAttachmentMessageProps {
  message: ClientAttachmentChatMessage
  isMe?: boolean
  sharedKey: CryptoKey
}

const ChatAttachmentMessage: React.FC<ChatAttachmentMessageProps> = ({
  message,
  isMe = false,
  sharedKey,
}) => {
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)
  const [isAttachmentDownloading, setIsAttachmentDownloading] = useState(false)

  const isDownloading = useRef(false)
  const downloadAttachment = useCallback(async () => {
    if (!message.content || !message.e2e || isAttachmentDownloading) return

    setIsAttachmentDownloading(true)
    isDownloading.current = true

    const response = await fetch(message.content)
    if (!response.ok) {
      throw new Error('Failed to fetch attachment')
    }
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()
    const iv = new Uint8Array(str2ab(atob(message.e2e!.iv)))
    const decryptedFile = await decryptMessage(buffer, iv, sharedKey)

    // If the component is unmounted, don't set the URL
    if (!isDownloading.current) return
    isDownloading.current = false

    const extension = message.contentFilename
      ? getExtension(message.contentFilename)
      : null
    const mimeType = extension ? extensionToMimeType[extension] : null
    const url = URL.createObjectURL(
      new Blob([decryptedFile], { type: mimeType ?? '' }),
    )
    console.log({ url })
    setAttachmentUrl(url)
    setIsAttachmentDownloading(false)
  }, [message, sharedKey, isAttachmentDownloading])

  useEffect(() => {
    return () => {
      isDownloading.current = false
      setIsAttachmentDownloading(false)
      if (attachmentUrl) {
        URL.revokeObjectURL(attachmentUrl)
        setAttachmentUrl(null)
      }
    }
  }, [attachmentUrl])

  return (
    <ChatMessage isMe={isMe} sentAt={message.sentAt}>
      {!attachmentUrl ? (
        <button
          className={classNames(
            'flex items-center gap-2 hover:bg-foreground/10 p-2 rounded-lg transition-colors',
            isAttachmentDownloading ? 'cursor-default' : 'cursor-pointer',
          )}
          disabled={isAttachmentDownloading}
          onClick={downloadAttachment}
        >
          <div className='bg-foreground/5 p-2 rounded-lg'>
            {!isAttachmentDownloading ? (
              <FiDownload size={18} />
            ) : (
              <BasicSpinner className='w-5 h-5 text-foreground' />
            )}
          </div>
          <div className='overflow-hidden'>
            <p className='truncate'>{message.contentFilename}</p>
            <p className='text-xs text-foreground/70'>Click to open</p>
          </div>
        </button>
      ) : (
        <a
          href={attachmentUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-2 hover:bg-foreground/10 p-2 rounded-lg transition-colors'
        >
          <div className='bg-foreground/5 p-2 rounded-lg'>
            <FiFile size={20} />
          </div>
          <div className='overflow-hidden'>
            <p className='truncate'>{message.contentFilename}</p>
            <p className='text-xs text-foreground/70'>Click to open</p>
          </div>
        </a>
      )}
    </ChatMessage>
  )
}

export default ChatAttachmentMessage
