import { useCallback, useState } from 'react'

import { ListingFormData } from '@/types/marketplace'
import { createListing, updateListing } from '@/services/marketplace'
import env from '@/utils/frontend/env'

interface UseListingFormProps {
  initialData?: ListingFormData
  listingId?: string
  onSuccess?: (id: string) => void
}

export const useListingForm = ({ initialData, listingId, onSuccess }: UseListingFormProps = {}) => {
  // Initialize with default values or provided initialData
  const [formData, setFormData] = useState<ListingFormData>(() => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priceInCents: initialData?.priceInCents || 0,
    category: initialData?.category || 'jade',
    countries: initialData?.countries || ['hk'],
  }))

  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form field changes
  const handlePriceInCentsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      priceInCents: Math.floor(parseFloat(value) * 100)
    }))
  }

  // Handle image selection
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) { return }

    // Limit to 5 images
    const MAX_FILES = env.NEXT_PUBLIC_MARKET_LISTING_ATTACHMENT_LIMIT
    const newImages = Array.from(e.target.files).slice(0, MAX_FILES - images.length)
    setImages(prev => [...prev, ...newImages])
  }, [images.length])

  // Remove an image from the selection
  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Submit the form
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = listingId
        ? await updateListing(listingId, formData, images)
        : await createListing(formData, images)

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result.id)
      }

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the listing')
      console.error('Error processing listing:', err)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, images, listingId, onSuccess])

  return {
    formData,
    images,
    isSubmitting,
    error,
    handleChange,
    handlePriceInCentsChange,
    handleImageChange,
    removeImage,
    handleSubmit
  }
}
