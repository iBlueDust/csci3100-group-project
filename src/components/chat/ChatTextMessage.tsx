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
      <p>
        {message.content.split('\n').map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
    </ChatMessage>
  )
}

export default ChatTextMessage
