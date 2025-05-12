import React from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import classNames from 'classnames'

import BasicSpinner from '@/components/BasicSpinner'

export interface ChatRecipientLeftBannerProps {
  isDeleting?: boolean
  onDelete?: () => void
}

const ChatRecipientLeftBanner: React.FC<ChatRecipientLeftBannerProps> = ({
  isDeleting = false,
  onDelete,
}) => {
  return (
    <div className='flex items-center gap-4 border-l-4 border-amber-400 bg-amber-50 p-4 text-amber-800'>
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
        className={classNames(
          'ml-auto align-middle text-xs',
          isDeleting
            ? 'text-amber-800/50 flex flex-row flex-nowrap gap-1 items-center'
            : 'text-amber-800 underline',
        )}
        disabled={isDeleting}
        onClick={onDelete}
      >
        {isDeleting ? (
          <>
            <BasicSpinner />
            <span>Deleting...</span>
          </>
        ) : (
          'Delete Chat'
        )}
      </button>
    </div>
  )
}

export default ChatRecipientLeftBanner
