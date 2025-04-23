import classNames from 'classnames'
import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export interface MiniPaginationControlsProps {
  indexOfFirstItem: number | undefined
  indexOfLastItem: number | undefined
  numberOfItems: number | undefined
  onPrevClick?: () => void
  onNextClick?: () => void
}

const MiniPaginationControls: React.FC<MiniPaginationControlsProps> = ({
  indexOfFirstItem,
  indexOfLastItem,
  numberOfItems,
  onPrevClick,
  onNextClick,
}) => {
  const noData =
    indexOfFirstItem == null || indexOfLastItem == null || numberOfItems == null

  return (
    <div className='flex flex-row items-center'>
      <button
        onClick={onPrevClick}
        disabled={indexOfFirstItem === 0}
        className={classNames(
          'px-2 py-1',
          noData || indexOfFirstItem === 0
            ? 'text-foreground/30 cursor-not-allowed'
            : 'text-foreground/70 hover:text-foreground',
        )}
      >
        <FiChevronLeft />
      </button>

      <span className='mx-2 text-sm'>
        {!noData
          ? `${indexOfFirstItem + 1}-${Math.min(
              indexOfLastItem,
              numberOfItems,
            )} of ${numberOfItems}`
          : '-- of --'}
      </span>

      <button
        onClick={onNextClick}
        disabled={noData || indexOfLastItem === numberOfItems - 1}
        className={classNames(
          'px-2 py-1',
          noData || indexOfLastItem === numberOfItems - 1
            ? 'text-foreground/30 cursor-not-allowed'
            : 'text-foreground/70 hover:text-foreground',
        )}
      >
        <FiChevronRight />
      </button>
    </div>
  )
}

export default MiniPaginationControls
