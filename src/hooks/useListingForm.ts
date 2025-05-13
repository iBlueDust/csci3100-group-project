import { useCallback, useState } from 'react'

import type { MarketListingFormData } from '@/components/marketplace/NewMarketListingModal'
import { createMarketListing } from '@/data/frontend/mutations/createMarketListing'
import { PostMarketListingPayload } from '@/data/frontend/fetches/postMarketListing'
import { updateMarketListing } from '@/data/frontend/mutations/updateMarketListing'
import { PatchMarketListingPayload } from '@/data/frontend/fetches/patchMarketListing'
import { useApi } from '@/hooks/useApi'
import env from '@/utils/frontend/env'

type UseListingFormProps = {
  onSuccess?: (id: string) => void
} & (
    {
      initialData?: MarketListingFormData
      listingId?: string
    }
    |
    {
      initialData?: undefined
      listingId?: undefined
    }
  )

export const useListingForm = ({
  initialData,
  listingId,
  onSuccess,
}: UseListingFormProps = {}) => {
  const api = useApi()

  // Initialize with default values or provided initialData
  const [formData, setFormData] = useState<MarketListingFormData>(() => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priceInCents: initialData?.priceInCents || 0,
    pictures: initialData?.pictures || [],
    categories: initialData?.categories || ['jade'],
    countries: initialData?.countries || ['hk'],
  }))

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
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      categories: value.split(',').map(c => c.trim().toLowerCase())
    }))
  }

  // Handle form field changes
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      countries: value.split(',').map(c => c.trim().toLowerCase())
    }))
  }

  // Handle form field changes
  const handlePriceInCentsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value } = e.target
    const EPSILON = 1e-6 // Floating point arithmetic error happens here
    const priceInCents = Math.floor(parseFloat(value) * 100 + EPSILON)
    setFormData(prev => ({
      ...prev,
      priceInCents
    }))
  }

  // Handle image selection
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) { return }

    // Limit to 5 images
    const MAX_FILES = env.NEXT_PUBLIC_MARKET_LISTING_ATTACHMENT_LIMIT
    const { files } = e.target
    setFormData(prev => ({
      ...prev,
      pictures: [...prev.pictures, ...files].slice(0, MAX_FILES),
    }))
  }, [])

  // Remove an image from the selection
  const removeImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      pictures: [
        ...prev.pictures.slice(0, index),
        ...prev.pictures.slice(index + 1),
      ]
    }))
  }, [])

  // Submit the form
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    let result: { id: string } | null = null

    if (listingId) {
      const payload: PatchMarketListingPayload = {}

      if (formData.title.trim() !== initialData?.title)
        payload.title = formData.title.trim()

      if (formData.description.trim() !== initialData?.description)
        payload.description = formData.description.trim()

      payload.priceInCents = formData.priceInCents

      if (formData.pictures.length > 0) {
        const originalPictureIndices = Object.fromEntries(
          initialData!.pictures.map((p, i) => [p, i])
        )

        payload.pictures = formData.pictures.map(p =>
          typeof p === 'string' ? originalPictureIndices[p] : p
        )
      }

      const setEqual = (a: string[], b: string[]) =>
        a.every((item) => b.includes(item)) && b.every((item) => a.includes(item))
      if (!initialData || !setEqual(formData.countries, initialData.countries))
        payload.countries = formData.countries

      payload.categories = formData.categories

      try {
        result = await updateMarketListing(api, listingId, payload)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while processing the listing')
        console.error('Error processing listing:', err)
        return null
      } finally {
        setIsSubmitting(false)
      }
    } else {
      const payload: PostMarketListingPayload = {
        ...formData,
        categories: formData.categories,
        pictures: formData.pictures as unknown as File[],
      }

      try {
        result = await createMarketListing(api, payload)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while processing the listing')
        console.error('Error processing listing:', err)
        return null
      } finally {
        setIsSubmitting(false)
      }

    }

    // Call success callback if provided
    if (onSuccess) {
      onSuccess(result.id)
    }

    return result
  }, [api, initialData, formData, listingId, onSuccess])

  return {
    formData,
    isSubmitting,
    error,
    handleChange,
    handleCategoryChange,
    handleCountryChange,
    handlePriceInCentsChange,
    handleImageChange,
    removeImage,
    handleSubmit
  }
}
