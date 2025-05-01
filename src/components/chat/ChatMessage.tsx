import classNames from 'classnames'
import React from 'react'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
dayjs.extend(isToday)

export interface ChatMessageProps {
  key?: string | number
  children?: React.ReactNode
  isMe?: boolean
  sentAt: string | number
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  children,
  key,
  isMe = false,
  sentAt,
}) => {
  const date = dayjs(sentAt)

  return (
    <div
      key={key}
      className={classNames(
        'max-w-[80%] rounded-lg px-4 py-2 w-max',
        isMe ? 'bg-blue-500 text-white ml-auto' : 'bg-background-dark mr-auto',
      )}
    >
      {children}

      <p
        className={classNames(
          'text-xs mt-1',
          isMe ? 'text-white/70 text-right' : 'text-foreground/50',
        )}
      >
        {date.isToday()
          ? date.format('HH:mm')
          : date.year() === dayjs().year()
          ? date.format('DD/MM HH:mm')
          : date.format('DD/MM/YYYY HH:mm')}
      </p>
    </div>
  )
}

export default ChatMessage
