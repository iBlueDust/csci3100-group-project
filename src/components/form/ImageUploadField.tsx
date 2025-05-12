import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { FiTrash2, FiUpload } from 'react-icons/fi'
import classNames from 'classnames'
import { useDragDrop } from '@/hooks/useDragDrop'

export interface ImageUploadProps {
  name: string
  images: (File | string)[]
  maxImages: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (index: number) => void
}

const ImageUploadField: React.FC<ImageUploadProps> = ({
  name,
  images,
  maxImages,
  onChange,
  onRemove,
}) => {
  const dragDrop = useDragDrop()

  const [imageUrls, setImageUrls] = useState<string[]>([])
  useEffect(() => {
    const urls: string[] = []
    const objectUrls: string[] = []
    for (const image of images) {
      if (typeof image === 'string') {
        urls.push(image)
        continue
      }

      const url = URL.createObjectURL(image)
      urls.push(url)
      objectUrls.push(url)
    }
    setImageUrls(urls)

    // Cleanup URLs on unmount
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [images])

  return (
    <div className='mb-6'>
      <label className='mb-1 block text-sm font-medium'>
        Images (up to {maxImages})
      </label>

      {images.length < maxImages && (
        <label
          className={classNames(
            'gap-8 justify-center flex flex-row items-center relative border-2 border-dashed border-foreground/30 rounded-md p-8 text-center cursor-pointer transition-colors mb-2',
            dragDrop.isDraggingOver
              ? 'bg-sky-500/15 border-sky-500'
              : 'hover:bg-background-dark focus:bg-background-dark/10',
          )}
        >
          <FiUpload
            size={24}
            color={dragDrop.isDraggingOver ? '#3b82f6' : '#999999'}
          />
          <p
            className={
              dragDrop.isDraggingOver ? 'text-sky-500' : 'text-foreground/70'
            }
          >
            {dragDrop.isDraggingOver
              ? 'Release to upload'
              : 'Click to upload images'}
          </p>
          <input
            ref={dragDrop.dropAreaRef}
            type='file'
            name={name}
            className='absolute inset-0 size-full cursor-pointer opacity-0'
            accept='image/*'
            onChange={onChange}
            multiple
          />
        </label>
      )}

      {imageUrls.length > 0 && (
        <div className='mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5'>
          {images.map((image, index) => (
            <div
              key={index}
              className='group relative overflow-hidden rounded'
              title={typeof image !== 'string' ? image.name : ''}
            >
              <div className='aspect-square border border-foreground/10 bg-background-dark'>
                <Image
                  width={100}
                  height={100}
                  src={imageUrls[index]}
                  alt={typeof image !== 'string' ? image.name : 'Listing image'}
                  className='size-full rounded object-cover'
                />
              </div>
              <button
                type='button'
                onClick={() => onRemove(index)}
                title='Delete'
                className='absolute right-0 top-0 rounded-bl bg-foreground/75 p-1 text-background opacity-0 transition-opacity hover:bg-foreground group-hover:opacity-100'
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageUploadField
