import React, { useEffect } from 'react'
import Image from 'next/image'

import type { ClientAttachmentChatMessage } from '@/data/types/chats'
import ChatMessage from './ChatMessage'
import { useAttachment } from '@/hooks/useAttachment'

export interface ChatImageMessageProps {
  message: ClientAttachmentChatMessage
  isMe?: boolean
  sharedKey: CryptoKey
}

const ChatImageMessage: React.FC<ChatImageMessageProps> = ({
  message,
  isMe = false,
  sharedKey,
}) => {
  const attachment = useAttachment(message, sharedKey)
  useEffect(() => {
    attachment.download()
    // intentionally omitting dependencies to only run once on mount
  }, [])

  return (
    <ChatMessage className='p-1' isMe={isMe} sentAt={message.sentAt}>
      {attachment.url ? (
        <a href={attachment.url} target='_blank' rel='noopener noreferrer'>
          <Image
            width={320}
            height={320}
            src={attachment.url}
            alt={message.contentFilename ?? 'Attachment Image'}
            title='Download'
            className='h-auto max-h-96 max-w-full rounded-lg'
          />
        </a>
      ) : (
        <div className='size-80 animate-pulse rounded-md bg-foreground-light/75' />
      )}
    </ChatMessage>
  )
}

export default ChatImageMessage
