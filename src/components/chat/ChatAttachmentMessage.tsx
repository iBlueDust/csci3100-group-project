import React from 'react'
import { FiDownload, FiFile } from 'react-icons/fi'
import classNames from 'classnames'

import type { ClientAttachmentChatMessage } from '@/types/chats'
import BasicSpinner from '@/components/BasicSpinner'
import ChatMessage from '@/components/chat/ChatMessage'
import { useAttachment } from '@/hooks/useAttachment'

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
  const attachment = useAttachment(message, sharedKey)

  return (
    <ChatMessage className='px-4 py-3' isMe={isMe} sentAt={message.sentAt}>
      {!attachment.url ? (
        <button
          className={classNames(
            'flex items-center gap-3 hover:bg-foreground/10 rounded-lg transition-colors',
            attachment.isDownloading ? 'cursor-default' : 'cursor-pointer',
          )}
          disabled={attachment.isDownloading}
          onClick={attachment.download}
        >
          <div className='rounded-lg bg-foreground/25 p-3'>
            {!attachment.isDownloading ? (
              <FiDownload size={18} />
            ) : (
              <BasicSpinner className='size-5 text-foreground' />
            )}
          </div>

          <div className='mr-2 overflow-hidden text-left'>
            <p className='truncate'>{message.contentFilename}</p>
            <p className='text-xs text-foreground/70'>Download attachment</p>
          </div>
        </button>
      ) : (
        <a
          href={attachment.url}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-foreground/10'
        >
          <div className='rounded-lg bg-foreground/5 p-2'>
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
