import React from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

export interface ChatRecipientLeftBannerProps {
  onDelete?: () => void
}

const ChatRecipientLeftBanner: React.FC<ChatRecipientLeftBannerProps> = ({
  onDelete,
}) => {
  return (
    <div className='bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-800 flex items-center gap-2 sticky top-0 z-10'>
      <FiAlertTriangle size={20} />
      <div>
        <p className='font-medium'>
          This conversation has been deleted by the other person.
        </p>
        <p className='text-sm'>
          You can still view these messages, but they can no longer reply.
        </p>
      </div>

      <button
        className='ml-auto text-xs text-amber-800 underline'
        onClick={onDelete}
      >
        Delete Chat
      </button>
    </div>
  )
}

export default ChatRecipientLeftBanner
