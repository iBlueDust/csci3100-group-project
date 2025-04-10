import React, { useState } from 'react'
import { FiX, FiUpload, FiTrash2 } from 'react-icons/fi'

// The same countries list as in the marketplace component
const countries = [
  { id: 'hk', name: 'Hong Kong' },
  { id: 'cn', name: 'China' },
  { id: 'tw', name: 'Taiwan' },
  { id: 'sg', name: 'Singapore' },
  { id: 'mo', name: 'Macau' }
]

// The same categories from the marketplace component
const categories = [
  { id: 'jade', name: 'Jade Items' },
  { id: 'antiques', name: 'Antiques' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'art', name: 'Artwork' },
  { id: 'gems', name: 'Precious Gems' }
]

interface CreateListingFormProps {
  onClose: () => void
  onSuccess?: (listingId: string) => void
}

const CreateListingForm: React.FC<CreateListingFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceInCents: '',
    category: 'jade',
    country: 'hk'
  })
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Limit to 5 images
      const newImages = Array.from(e.target.files).slice(0, 5 - images.length)
      setImages([...images, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Convert price to cents
      const priceInCents = Math.round(parseFloat(formData.priceInCents) * 100)
      
      // Create a FormData object for the API request
      const apiFormData = new FormData()
      apiFormData.append('title', formData.title)
      apiFormData.append('description', formData.description)
      apiFormData.append('priceInCents', priceInCents.toString())
      apiFormData.append('countries[]', formData.country)
      
      // Add images
      images.forEach(image => {
        apiFormData.append('pictures', image)
      })
      
      // In a real app, you'd make an API call like this:
      // const response = await fetch('/api/market/listings', {
      //   method: 'POST',
      //   body: apiFormData,
      //   // No Content-Type header as browser sets it with boundary for FormData
      // })
      
      // Mock success response for now
      console.log('Creating listing with data:', { formData, images })
      
      // Simulate API response
      setTimeout(() => {
        setIsSubmitting(false)
        const mockListingId = 'list_' + Math.random().toString(36).substring(2, 15)
        
        if (onSuccess) {
          onSuccess(mockListingId)
        }
      }, 1500)
    } catch (err) {
      setIsSubmitting(false)
      setError('An error occurred while creating the listing. Please try again.')
      console.error('Error creating listing:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-background w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-foreground/10">
          <h2 className="text-xl font-bold">Create New Listing</h2>
          <button 
            onClick={onClose}
            className="text-foreground/70 hover:text-foreground rounded-full p-1"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border-2 border-foreground/10 rounded-md"
              required
              maxLength={100}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border-2 border-foreground/10 rounded-md h-32"
              required
              maxLength={1000}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="priceInCents" className="block text-sm font-medium mb-1">
                Price ($)
              </label>
              <input
                type="number"
                id="priceInCents"
                name="priceInCents"
                value={formData.priceInCents}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full p-2 border-2 border-foreground/10 rounded-md"
                required
              />
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium mb-1">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-2 border-2 border-foreground/10 rounded-md bg-background"
                required
              >
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border-2 border-foreground/10 rounded-md bg-background"
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Images (up to 5)
            </label>
            
            {images.length < 5 && (
              <label className="block border-2 border-dashed border-foreground/30 rounded-md p-8 text-center cursor-pointer hover:bg-background-dark transition-colors mb-2">
                <FiUpload className="mx-auto mb-2" size={24} />
                <span className="block text-foreground/70">
                  Click to upload images
                </span>
                <input
                  type="file"
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
              </label>
            )}
            
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-background-dark border border-foreground/10 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-foreground text-background rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
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
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateListingForm
