import React from 'react'
import Image from 'next/image'

import type { ClientAttachmentChatMessage } from '@/data/types/chats'
import ChatMessage from './ChatMessage'

export interface ChatImageMessageProps {
  message: ClientAttachmentChatMessage
  isMe?: boolean
}

const ChatImageMessage: React.FC<ChatImageMessageProps> = ({
  message,
  isMe = false,
}) => {
  const content = message.content.toString()

  return (
    <ChatMessage isMe={isMe} sentAt={message.sentAt}>
      <a href={content}>
        <Image
          width={100}
          height={100}
          src={content}
          alt={message.contentFilename}
          className='max-w-full h-auto rounded-lg'
        />
      </a>
    </ChatMessage>
  )
}

export default ChatImageMessage
