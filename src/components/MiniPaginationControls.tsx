import classNames from 'classnames'
import React, { useMemo } from 'react'
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

  const { currentPage, totalPages } = useMemo(() => {
    if (noData) {
      return {
        currentPage: null,
        totalPages: null,
      }
    }

    const pageSize = indexOfLastItem - indexOfFirstItem + 1
    return {
      currentPage: Math.floor(indexOfFirstItem / pageSize) + 1,
      totalPages: Math.ceil(numberOfItems / pageSize),
    }
  }, [indexOfFirstItem, indexOfLastItem, numberOfItems, noData])

  return (
    <div className='flex flex-row items-center'>
      <button
        onClick={onPrevClick}
        disabled={currentPage! <= 1}
        className={classNames(
          'px-2 py-1',
          noData || currentPage! <= 1
            ? 'text-foreground/30 cursor-not-allowed'
            : 'text-foreground/70 cursor-pointer hover:text-foreground',
        )}
      >
        <FiChevronLeft />
      </button>

      <span className='mx-2 text-sm'>
        {!noData ? `${currentPage} of ${totalPages}` : '-- of --'}
      </span>

      <button
        onClick={onNextClick}
        disabled={noData || currentPage! >= totalPages!}
        className={classNames(
          'px-2 py-1',
          noData || currentPage! >= totalPages!
            ? 'text-foreground/30 cursor-not-allowed'
            : 'text-foreground/70 cursor-pointer hover:text-foreground',
        )}
      >
        <FiChevronRight />
      </button>
    </div>
  )
}

export default MiniPaginationControls
