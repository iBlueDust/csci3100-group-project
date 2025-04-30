import React from 'react'

import type { ClientAttachmentChatMessage } from '@/data/types/chats'
import ChatMessage from './ChatMessage'
import { FiPaperclip } from 'react-icons/fi'

export interface ChatAttachmentMessageProps {
  message: ClientAttachmentChatMessage
  isMe?: boolean
}

const ChatAttachmentMessage: React.FC<ChatAttachmentMessageProps> = ({
  message,
  isMe = false,
}) => {
  return (
    <ChatMessage isMe={isMe} sentAt={message.sentAt}>
      <a
        href={message.content.toString()}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center gap-2 hover:bg-foreground/10 p-2 rounded-lg transition-colors'
      >
        <div className='bg-foreground/5 p-2 rounded-lg'>
          <FiPaperclip size={18} />
        </div>
        <div className='overflow-hidden'>
          <p className='truncate'>{message.content}</p>
          <p className='text-xs text-foreground/70'>Click to open</p>
        </div>
      </a>
    </ChatMessage>
  )
}

export default ChatAttachmentMessage
