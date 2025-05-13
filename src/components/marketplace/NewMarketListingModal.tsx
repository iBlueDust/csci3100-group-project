import React from 'react'
import { FiX } from 'react-icons/fi'

import Input from '@/components/form/Input'
import Select from '@/components/form/Select'
import TextArea from '@/components/form/TextArea'
import ImageUploadField from '@/components/form/ImageUploadField'
import SubmitButton from '@/components/form/SubmitButton'
import { useListingForm } from '@/hooks/useListingForm'
import { countries } from '@/utils/countries'
import { categories } from '@/utils/categories'
import env from '@/utils/frontend/env'

export interface MarketListingFormData {
  title: string
  description: string
  pictures: (string | File)[]
  priceInCents: number
  countries: string[]
  categories?: string[]
}

export interface NewMarketListingModalProps {
  onClose: () => void
  onSuccess?: (listingId: string) => void
  initialData?: Partial<MarketListingFormData>
  listingId?: string
  isEditing?: boolean
}

const NewMarketListingModal: React.FC<NewMarketListingModalProps> = ({
  onClose,
  onSuccess,
  initialData,
  listingId,
  isEditing = false,
}) => {
  const {
    formData,
    isSubmitting,
    error,
    handleChange,
    handleCategoryChange,
    handleCountryChange,
    handlePriceInCentsChange,
    handleImageChange,
    removeImage,
    handleSubmit,
  } = useListingForm({
    initialData: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      pictures: initialData?.pictures || [],
      priceInCents: initialData?.priceInCents || 0,
      categories: initialData?.categories || ['jade'],
      countries: initialData?.countries || ['hk'],
    },
    listingId,
    onSuccess,
  })

  return (
    <div className='fixed inset-0 z-10 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-screen-sm overflow-hidden rounded-lg bg-background shadow-xl md:mx-auto md:max-w-2xl'>
        <div className='flex items-center justify-between border-b border-foreground/10 p-4'>
          <h2 className='text-xl font-bold'>
            {isEditing ? 'Edit Listing' : 'Create New Listing'}
          </h2>
          <button
            onClick={onClose}
            className='rounded-full p-1 text-foreground/70 hover:text-foreground'
          >
            <FiX size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex max-h-[70vh] flex-col gap-6 overflow-y-auto p-6'
        >
          {error && (
            <div className='rounded-md bg-red-100 p-3 text-red-700'>
              {error}
            </div>
          )}

          <Input
            name='title'
            label='Title'
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
          />

          <TextArea
            name='description'
            label='Description'
            value={formData.description}
            rows={4}
            maxLength={1000}
            required
            onChange={handleChange}
          />

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Input
              name='priceInCents'
              label='Price (USD)'
              value={formData.priceInCents / 100}
              onChange={handlePriceInCentsChange}
              type='number'
              step='0.01'
              min='0.00'
              required
            />

            <Select
              name='countries'
              label='Country'
              value={formData.countries[0].toUpperCase()}
              onChange={handleCountryChange}
              options={countries.filter((country) => country.id !== 'all')}
              required
            />
          </div>

          <Select
            name='categories'
            label='Category'
            value={formData.categories?.[0]}
            onChange={handleCategoryChange}
            options={categories}
            required
          />

          <ImageUploadField
            name='pictures'
            images={formData.pictures}
            maxImages={env.NEXT_PUBLIC_MARKET_LISTING_ATTACHMENT_LIMIT}
            onChange={handleImageChange}
            onRemove={removeImage}
          />

          <div className='flex justify-end gap-3'>
            <SubmitButton
              type='button'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </SubmitButton>
            <SubmitButton type='submit' look='primary' loading={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                ? 'Update Listing'
                : 'Create Listing'}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewMarketListingModal
