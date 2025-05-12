import React from 'react'
import ChatMessage from './ChatMessage'
import type { ClientTextChatMessage } from '@/data/types/chats'

export interface ChatTextMessageProps {
  message: ClientTextChatMessage
  isMe?: boolean
}

const ChatTextMessage: React.FC<ChatTextMessageProps> = ({
  message,
  isMe = false,
}) => {
  return (
    <ChatMessage className='px-4 py-2' isMe={isMe} sentAt={message.sentAt}>
      <p className='whitespace-pre-wrap'>{message.content}</p>
    </ChatMessage>
  )
}

export default ChatTextMessage
