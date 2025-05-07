
import { Listing, ListingFormData } from '@/types/marketplace'

/**
 * Create a new listing
 */
export async function createListing(formData: ListingFormData, images: File[]): Promise<{ id: string }> {

  const apiFormData = new FormData()
  apiFormData.append('title', formData.title.trim())
  apiFormData.append('description', formData.description.trim())


  const priceInCents = formData.priceInCents
  apiFormData.append('priceInCents', priceInCents.toString())

  formData.countries.forEach(country => apiFormData.append('countries', country))
  images.forEach(image => apiFormData.append('pictures', image))

  const response = await fetch('/api/market/listings', {
    method: 'POST',
    body: apiFormData,

  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error creating listing')
  }

  return response.json()
}

/**
 * Update an existing listing
 */
export async function updateListing(
  id: string,
  formData: Partial<ListingFormData>,
  newImages?: File[],
  imageIndexesToKeep?: number[]
): Promise<Listing> {
  const apiFormData = new FormData()


  if (formData.title) apiFormData.append('title', formData.title.trim())
  if (formData.description) apiFormData.append('description', formData.description.trim())

  apiFormData.append('priceInCents', formData.priceInCents?.toString() ?? '0')
  formData.countries?.forEach(country => apiFormData.append('countries', country))


  if (imageIndexesToKeep && imageIndexesToKeep.length > 0) {
    imageIndexesToKeep.forEach(index => {
      apiFormData.append('pictures[]', index.toString())
    })
  }


  if (newImages && newImages.length > 0) {
    newImages.forEach(image => {
      apiFormData.append('newPictures', image)
    })
  }

  const response = await fetch(`/api/market/listings/${id}`, {
    method: 'PATCH',
    body: apiFormData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error updating listing')
  }

  return response.json()
}
