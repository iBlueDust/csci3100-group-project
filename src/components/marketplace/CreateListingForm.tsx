import React from 'react'
import { FiX } from 'react-icons/fi'

import Input from '@/components/form/Input'
import Select from '@/components/form/Select'
import TextArea from '@/components/form/TextArea'
import ImageUploadField from '@/components/form/ImageUploadField'
import SubmitButton from '@/components/form/SubmitButton'
import { useListingForm } from '@/hooks/useListingForm'
import { CategoryOption, ListingFormData } from '@/types/marketplace'
import { countries } from '@/utils/countries'
import env from '@/utils/frontend/env'

// The same categories from the marketplace component
const categories: CategoryOption[] = [
  { id: 'jade', name: 'Jade Items' },
  { id: 'antiques', name: 'Antiques' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'art', name: 'Artwork' },
  { id: 'gems', name: 'Precious Gems' },
]

interface CreateListingFormProps {
  onClose: () => void
  onSuccess?: (listingId: string) => void
  initialData?: ListingFormData
  listingId?: string
  isEditing?: boolean
}

const CreateListingForm: React.FC<CreateListingFormProps> = ({
  onClose,
  onSuccess,
  initialData,
  listingId,
  isEditing = false,
}) => {
  const {
    formData,
    images,
    isSubmitting,
    error,
    handleChange,
    handlePriceInCentsChange,
    handleImageChange,
    removeImage,
    handleSubmit,
  } = useListingForm({ initialData, listingId, onSuccess })

  return (
    <div className='fixed inset-0 bg-foreground/30 backdrop-blur-sm flex justify-center items-center z-50 p-4'>
      <div className='bg-background w-full max-w-screen-sm md:max-w-2xl md:mx-auto rounded-lg shadow-xl overflow-hidden'>
        <div className='flex justify-between items-center p-4 border-b border-foreground/10'>
          <h2 className='text-xl font-bold'>
            {isEditing ? 'Edit Listing' : 'Create New Listing'}
          </h2>
          <button
            onClick={onClose}
            className='text-foreground/70 hover:text-foreground rounded-full p-1'
          >
            <FiX size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-6'
        >
          {error && (
            <div className='p-3 bg-red-100 text-red-700 rounded-md'>
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

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
              id='country'
              name='country'
              label='Country'
              value={formData.countries[0].toUpperCase()}
              onChange={handleChange}
              options={countries.filter((country) => country.id !== 'all')}
              required
            />
          </div>

          <Select
            name='category'
            label='Category'
            value={formData.category}
            onChange={handleChange}
            options={categories}
            required
          />

          <ImageUploadField
            name='pictures'
            images={images}
            maxImages={env.NEXT_PUBLIC_MARKET_LISTING_ATTACHMENT_LIMIT}
            onChange={handleImageChange}
            onRemove={removeImage}
          />

          <div className='flex gap-3 justify-end'>
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

export default CreateListingForm
