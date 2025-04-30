import classNames from 'classnames'
import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export interface PaginationControlsProps {
  indexOfFirstItem: number | undefined
  indexOfLastItem: number | undefined
  numberOfItems: number | undefined
  pageSize: number
  onPrevClick?: () => void
  onNextClick?: () => void
  onPageClick?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  indexOfFirstItem,
  indexOfLastItem,
  numberOfItems,
  pageSize,
  onPrevClick,
  onNextClick,
  onPageClick,
  onPageSizeChange,
}) => {
  const noData =
    indexOfFirstItem == null || indexOfLastItem == null || numberOfItems == null

  type PaginationParams = typeof noData extends true ? number : null

  const totalPages = (
    !noData ? Math.ceil(numberOfItems / pageSize) : null
  ) as PaginationParams

  const currentPage = (
    !noData ? Math.ceil(indexOfFirstItem / pageSize) + 1 : null
  ) as PaginationParams

  const padding = 3
  const startPage = (
    !noData ? Math.max(1, currentPage! - padding) : null
  ) as PaginationParams
  const endPage = (
    !noData ? Math.min(totalPages!, currentPage! + padding) : null
  ) as PaginationParams

  const pages =
    !noData && totalPages! > 0
      ? Array.from(
          { length: endPage! - startPage! + 1 },
          (_, i) => i + startPage!,
        )
      : [1]

  return (
    <div className='mt-8 flex justify-center flex-row items-center gap-4'>
      <p className='text-sm text-foreground-light sm:ml-4'>
        {!noData
          ? `Showing ${indexOfFirstItem + 1}-${Math.min(
              indexOfLastItem + 1,
              numberOfItems,
            )} of ${numberOfItems} items`
          : 'Showing -- of -- items'}
      </p>

      <div className='flex border border-foreground-light/50 rounded-md overflow-hidden'>
        <button
          onClick={onPrevClick}
          disabled={indexOfFirstItem === 0}
          className={`px-3 sm:px-4 py-2 border-r border-foreground-light/50 flex items-center ${
            indexOfFirstItem === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FiChevronLeft className='mr-1' />
        </button>

        <div className='flex'>
          {pages.map((page) => (
            <label
              key={page}
              className={classNames(
                'px-3 sm:px-4 py-2 cursor-pointer',
                currentPage === page
                  ? 'rounded bg-gray-500/25 border-foreground-light border text-foreground font-bold'
                  : 'hover:bg-background-light',
              )}
              onChange={
                currentPage === page || !onPageClick
                  ? undefined
                  : () => onPageClick(page)
              }
            >
              <span>{page}</span>
              <input
                type='radio'
                name='page-number'
                value={page}
                checked={noData || currentPage === page}
                readOnly={currentPage === page || !onPageClick}
                onChange={
                  currentPage === page || !onPageClick
                    ? undefined
                    : () => onPageClick(page)
                }
                className='hidden'
              />
            </label>
          ))}
        </div>

        <button
          onClick={onNextClick}
          disabled={noData || indexOfLastItem === numberOfItems - 1}
          className={classNames(
            'px-3 sm:px-4 py-2 border-l-2 border-foreground/10 flex items-center',
            noData ||
              (indexOfLastItem === numberOfItems - 1 &&
                'opacity-50 cursor-not-allowed'),
          )}
        >
          <FiChevronRight />
        </button>
      </div>

      {/* Spacer */}
      <div className='w-4'></div>

      <p className='text-sm text-foreground/70'>Items per page:</p>
      <select
        value={pageSize}
        onChange={
          onPageSizeChange
            ? (e) => onPageSizeChange(Number(e.target.value))
            : undefined
        }
        className='ml-2 px-2 py-1 border self-stretch border-foreground-light/50 rounded-md text-foreground bg-background'
      >
        <option value={8}>8</option>
        <option value={16}>16</option>
        <option value={32}>32</option>
      </select>
    </div>
  )
}

export default PaginationControls
