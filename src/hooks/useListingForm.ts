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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePriceInCentsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      priceInCents: Math.floor(parseFloat(value) * 100)
    }))
  }

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) { return }

    const MAX_FILES = env.NEXT_PUBLIC_MARKET_LISTING_ATTACHMENT_LIMIT
    const newImages = Array.from(e.target.files).slice(0, MAX_FILES - images.length)
    setImages(prev => [...prev, ...newImages])
  }, [images.length])

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = listingId
        ? await updateListing(listingId, formData, images)
        : await createListing(formData, images)

      if (onSuccess) {
        onSuccess(result.id)
      }

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the listing')

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
