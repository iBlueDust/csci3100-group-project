import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { FiTrash2, FiUpload } from 'react-icons/fi'
import classNames from 'classnames'

export interface ImageUploadProps {
  name: string
  images: File[]
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
  const fileDropRef = useRef<HTMLInputElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const [imageUrls, setImageUrls] = useState<string[]>([])
  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image))
    setImageUrls(urls)

    // Cleanup URLs on unmount
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [images])

  useEffect(() => {
    if (!fileDropRef.current) return

    const onDragEnter = () => {
      console.log('dragenter')
      setIsDraggingOver(true)
    }
    const onDragLeave = () => {
      console.log('dragleave')
      setIsDraggingOver(false)
    }

    const elem = fileDropRef.current
    elem.addEventListener('dragenter', onDragEnter)
    elem.addEventListener('dragleave', onDragLeave)
    elem.addEventListener('dragend', onDragLeave)
    elem.addEventListener('drop', onDragLeave)

    return () => {
      elem.removeEventListener('dragenter', onDragEnter)
      elem.removeEventListener('dragleave', onDragLeave)
      elem.removeEventListener('dragend', onDragLeave)
      elem.removeEventListener('drop', onDragLeave)
    }
  }, [fileDropRef])

  return (
    <div className='mb-6'>
      <label className='block text-sm font-medium mb-1'>
        Images (up to {maxImages})
      </label>

      {images.length < maxImages && (
        <label
          className={classNames(
            'gap-8 justify-center flex flex-row items-center relative border-2 border-dashed border-foreground/30 rounded-md p-8 text-center cursor-pointer transition-colors mb-2',
            isDraggingOver
              ? 'bg-sky-500/15 border-sky-500'
              : 'hover:bg-background-dark focus:bg-background-dark/10',
          )}
        >
          <FiUpload size={24} color={isDraggingOver ? '#3b82f6' : '#999999'} />
          <p className={isDraggingOver ? 'text-sky-500' : 'text-foreground/70'}>
            {isDraggingOver ? 'Release to upload' : 'Click to upload images'}
          </p>
          <input
            ref={fileDropRef}
            type='file'
            name={name}
            className='inset-0 w-full h-full absolute opacity-0 cursor-pointer'
            accept='image/*'
            onChange={onChange}
            multiple
          />
        </label>
      )}

      {imageUrls.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2'>
          {images.map((image, index) => (
            <div
              key={index}
              className='relative group overflow-hidden rounded'
              title={image.name}
            >
              <div className='aspect-square bg-background-dark border border-foreground/10'>
                <Image
                  width={100}
                  height={100}
                  src={imageUrls[index]}
                  alt={image.name}
                  className='object-cover rounded h-full w-full'
                />
              </div>
              <button
                type='button'
                onClick={() => onRemove(index)}
                title='Delete'
                className='absolute top-0 right-0 bg-foreground/75 text-background rounded-bl p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground'
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
