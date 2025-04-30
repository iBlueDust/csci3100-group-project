import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { FiTrash2, FiUpload } from 'react-icons/fi'

export interface ImageUploadProps {
  images: File[]
  maxImages: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (index: number) => void
}

const ImageUploadField: React.FC<ImageUploadProps> = ({
  images,
  maxImages,
  onChange,
  onRemove,
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image))
    setImageUrls(urls)

    // Cleanup URLs on unmount
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [images])

  return (
    <div className='mb-6'>
      <label className='block text-sm font-medium mb-1'>
        Images (up to {maxImages})
      </label>

      {images.length < maxImages && (
        <label className='gap-8 justify-center flex flex-row items-center border-2 border-dashed border-foreground/30 rounded-md p-8 text-center cursor-pointer hover:bg-background-dark transition-colors mb-2'>
          <FiUpload size={24} color='#999999' />
          <span className='block text-foreground/70'>
            Click to upload images
          </span>
          <input
            type='file'
            className='hidden'
            accept='image/*'
            onChange={onChange}
            multiple
          />
        </label>
      )}

      {imageUrls.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2'>
          {images.map((image, index) => (
            <div key={index} className='relative group' title={image.name}>
              <div className='aspect-square bg-background-dark border border-foreground/10 rounded flex items-center justify-center overflow-hidden'>
                <Image
                  width={100}
                  height={100}
                  src={imageUrls[index]}
                  alt={image.name}
                  className='object-cover h-full w-full'
                />
              </div>
              <button
                type='button'
                onClick={() => onRemove(index)}
                className='absolute top-1 right-1 bg-foreground text-background rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <FiTrash2 size={24} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageUploadField
