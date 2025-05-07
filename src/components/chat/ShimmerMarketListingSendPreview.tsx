import React from 'react'
import { FiTrash2 } from 'react-icons/fi'

export interface MarketListingSendPreviewProps {
  onCancel?: () => void
}

const MarketListingSendPreview: React.FC<MarketListingSendPreviewProps> = ({
  onCancel,
}) => {
  return (
    <div className='group mb-2 flex items-stretch gap-4 rounded-lg border-2 border-foreground/10 bg-background-dark/10'>
      <div className='flex size-20 items-center justify-center rounded-l-md bg-background-dark' />

      <div className='flex flex-1 flex-col flex-nowrap justify-between gap-2 py-2'>
        <div className='flex justify-between gap-2'>
          <div className='inline-block'>
            <div className='mb-1 h-4 w-12 animate-pulse rounded bg-foreground-light' />
            <div className='line-clamp-2 text-xs text-foreground/70'>
              <span className='mb-1 h-4 w-20 animate-pulse rounded bg-foreground-light' />
              <span className='mb-1 h-4 w-16 animate-pulse rounded bg-foreground-light' />
            </div>
          </div>

          <div className='mb-1 h-6 w-10 animate-pulse rounded bg-foreground-light' />
        </div>

        <div className='group:md:block hidden space-x-4 text-xs text-foreground-light'>
          <span className='mb-1 h-2 w-6 animate-pulse rounded bg-foreground-light' />
          <span className='group:md:inline-block mb-1 hidden h-2 w-6 animate-pulse rounded bg-foreground-light' />
          <span className='group:md:inline-block mb-1 hidden h-2 w-6 animate-pulse rounded bg-foreground-light' />
          <span className='mb-1 h-2 w-6 animate-pulse rounded bg-foreground-light' />
        </div>
      </div>

      <button
        onClick={onCancel}
        className='mr-2 self-center text-foreground/70 transition-colors hover:text-red-500'
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  )
}

export default MarketListingSendPreview
