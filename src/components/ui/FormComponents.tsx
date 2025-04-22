import React from 'react'
import Image from 'next/image'

interface FormFieldProps {
  id: string
  name: string
  label: string
  value: string | number
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void
  required?: boolean
  maxLength?: number
  type?: string
  min?: string
  step?: string
  placeholder?: string
  className?: string
}

interface SelectFieldProps
  extends Omit<FormFieldProps, 'type' | 'maxLength' | 'min' | 'step'> {
  options: { id: string; name: string }[]
}

interface ImageUploadProps {
  images: File[]
  maxImages: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (index: number) => void
}

export const InputField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  maxLength,
  type = 'text',
  min,
  step,
  placeholder,
  className = '',
}) => {
  return (
    <div className='mb-4'>
      <label htmlFor={id} className='block text-sm font-medium mb-1'>
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border-2 border-foreground/10 rounded-md ${className}`}
        required={required}
        maxLength={maxLength}
        min={min}
        step={step}
        placeholder={placeholder}
      />
    </div>
  )
}

export const TextAreaField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  maxLength,
  placeholder,
  className = '',
}) => {
  return (
    <div className='mb-4'>
      <label htmlFor={id} className='block text-sm font-medium mb-1'>
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border-2 border-foreground/10 rounded-md h-32 ${className}`}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
      />
    </div>
  )
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  options,
  className = '',
}) => {
  return (
    <div className='mb-4'>
      <label htmlFor={id} className='block text-sm font-medium mb-1'>
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border-2 border-foreground/10 rounded-md bg-background ${className}`}
        required={required}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export const ImageUploadField: React.FC<ImageUploadProps> = ({
  images,
  maxImages,
  onChange,
  onRemove,
}) => {
  return (
    <div className='mb-6'>
      <label className='block text-sm font-medium mb-1'>
        Images (up to {maxImages})
      </label>

      {images.length < maxImages && (
        <label className='block border-2 border-dashed border-foreground/30 rounded-md p-8 text-center cursor-pointer hover:bg-background-dark transition-colors mb-2'>
          <div className='mx-auto mb-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
              <polyline points='17 8 12 3 7 8'></polyline>
              <line x1='12' y1='3' x2='12' y2='15'></line>
            </svg>
          </div>
          <span className='block text-foreground/70'>
            Click to upload images
          </span>
          <input
            type='file'
            onChange={onChange}
            multiple
            accept='image/*'
            className='hidden'
          />
        </label>
      )}

      {images.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2'>
          {images.map((image, index) => (
            <div key={index} className='relative group'>
              <div className='aspect-square bg-background-dark border border-foreground/10 rounded flex items-center justify-center overflow-hidden'>
                <Image
                  width={100}
                  height={100}
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className='object-cover h-full w-full'
                />
              </div>
              <button
                type='button'
                onClick={() => onRemove(index)}
                className='absolute top-1 right-1 bg-foreground text-background rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='3 6 5 6 21 6'></polyline>
                  <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'></path>
                  <line x1='10' y1='11' x2='10' y2='17'></line>
                  <line x1='14' y1='11' x2='14' y2='17'></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
