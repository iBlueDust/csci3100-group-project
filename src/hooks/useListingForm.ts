import { useCallback, useState } from 'react'

import { ListingFormData } from '@/types/marketplace'
import { createMarketListing } from '@/data/frontend/mutations/createMarketListing'
import env from '@/utils/frontend/env'
import { useApi } from '@/utils/frontend/api'
import { PostMarketListingPayload } from '@/data/frontend/fetches/postMarketListing'
import { updateMarketListing } from '@/data/frontend/mutations/updateMarketListing'
import { PatchMarketListingPayload } from '@/data/frontend/fetches/patchMarketListing'

type UseListingFormProps = {
  onSuccess?: (id: string) => void
} & (
    {
      initialData?: ListingFormData
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

  const [formData, setFormData] = useState<ListingFormData>(() => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priceInCents: initialData?.priceInCents || 0,
    pictures: initialData?.pictures || [],
    category: initialData?.category || 'jade',
    countries: initialData?.countries || ['hk'],
  }))

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form field changes
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value.split(',').map(c => c.trim().toLowerCase())
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
    const { files } = e.target
    setFormData(prev => ({
      ...prev,
      pictures: [...prev.pictures, ...files].slice(0, MAX_FILES),
    }))
  }, [])

  const removeImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      pictures: [
        ...prev.pictures.slice(0, index),
        ...prev.pictures.slice(index + 1),
      ]
    }))
  }, [])

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
      if (formData.priceInCents !== initialData?.priceInCents)
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

      payload.categories = formData.category ? [formData.category] : []

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
        categories: formData.category ? [formData.category] : [],
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
    handleCountryChange,
    handlePriceInCentsChange,
    handleImageChange,
    removeImage,
    handleSubmit
  }
}
