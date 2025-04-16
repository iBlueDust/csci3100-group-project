import React from 'react'
import { FiX } from 'react-icons/fi'
import { countries } from '@/utils/countries'
import { useListingForm } from '@/hooks/useListingForm'
import { InputField, TextAreaField, SelectField, ImageUploadField } from '@/components/ui/FormComponents'
import { CategoryOption, ListingFormData } from '@/types/marketplace'

// The same categories from the marketplace component
const categories: CategoryOption[] = [
  { id: 'jade', name: 'Jade Items' },
  { id: 'antiques', name: 'Antiques' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'art', name: 'Artwork' },
  { id: 'gems', name: 'Precious Gems' }
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
  isEditing = false 
}) => {
  const { 
    formData, 
    images, 
    isSubmitting, 
    error,
    handleChange,
    handleImageChange,
    removeImage,
    handleSubmit 
  } = useListingForm({ initialData, listingId, onSuccess })

  return (
    <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-background w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-foreground/10">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Listing' : 'Create New Listing'}</h2>
          <button 
            onClick={onClose}
            className="text-foreground/70 hover:text-foreground rounded-full p-1"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <InputField
            id="title"
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
          />
          
          <TextAreaField
            id="description"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            required
            maxLength={1000}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="priceInCents"
              name="priceInCents"
              label="Price ($)"
              value={formData.priceInCents}
              onChange={handleChange}
              type="number"
              step="0.01"
              min="0"
              required
            />
            
            <SelectField
              id="country"
              name="country"
              label="Country"
              value={formData.country}
              onChange={handleChange}
              options={countries.filter(country => country.id !== 'all')}
              required
            />
          </div>
          
          <SelectField
            id="category"
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
            options={categories}
            required
          />
          
          <ImageUploadField 
            images={images}
            maxImages={5}
            onChange={handleImageChange}
            onRemove={removeImage}
          />

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="button px-5 py-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary px-5 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Listing' : 'Create Listing')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


export default CreateListingForm
