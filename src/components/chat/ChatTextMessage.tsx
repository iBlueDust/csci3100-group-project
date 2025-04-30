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
    <ChatMessage isMe={isMe} sentAt={message.sentAt}>
      <p>{message.content}</p>
    </ChatMessage>
  )
}

export default ChatTextMessage
