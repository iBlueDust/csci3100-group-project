import React from 'react'
import { FiPaperclip, FiTrash2 } from 'react-icons/fi'

import { formatBytes } from '@/utils/format'

export interface AttachmentSendPreviewProps {
  name: string
  size: number
  onCancel?: () => void
}

const AttachmentSendPreview: React.FC<AttachmentSendPreviewProps> = ({
  name,
  size,
  onCancel,
}) => {
  return (
    <div className='mb-2 flex items-center justify-between rounded-lg border-2 border-foreground/10 bg-background-dark/10 p-2'>
      <div className='flex items-center gap-2'>
        <div className='rounded-lg bg-foreground/5 p-2'>
          <FiPaperclip size={18} />
        </div>
        <div>
          <p className='truncate text-sm'>{name}</p>
          <p className='text-xs text-foreground/70'>{formatBytes(size, 1)}</p>
        </div>
      </div>
      <button
        onClick={onCancel}
        className='text-foreground/70 transition-colors hover:text-red-500'
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  )
}

export default AttachmentSendPreview
