// Services for handling marketplace API calls
import { Listing, ListingApiResponse, ListingFilters, ListingFormData } from '@/types/marketplace';

/**
 * Fetch listings with optional filters
 */
export async function fetchListings(filters?: ListingFilters): Promise<ListingApiResponse> {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  
  if (filters?.query) queryParams.append('query', filters.query);
  if (filters?.category && filters.category !== 'all') queryParams.append('category', filters.category);
  if (filters?.minPrice) queryParams.append('priceMin', filters.minPrice);
  if (filters?.maxPrice) queryParams.append('priceMax', filters.maxPrice);
  if (filters?.country && filters.country !== 'all') queryParams.append('countries', filters.country);
  
  const queryString = queryParams.toString();
  const url = `/api/market/listings${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching listings: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch a single listing by ID
 */
export async function fetchListingById(id: string): Promise<Listing> {
  const response = await fetch(`/api/market/listings/${id}`);
  
  if (!response.ok) {
    throw new Error(`Error fetching listing: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Create a new listing
 */
export async function createListing(formData: ListingFormData, images: File[]): Promise<{ id: string }> {
  // Create a FormData object for the API request
  const apiFormData = new FormData();
  apiFormData.append('title', formData.title.trim());
  apiFormData.append('description', formData.description.trim());
  
  // Convert price from dollars to cents
  const priceInCents = Math.round(parseFloat(formData.priceInCents) * 100);
  apiFormData.append('priceInCents', priceInCents.toString());
  
  // Add country
  apiFormData.append('countries[]', formData.country);
  
  // Add images
  images.forEach(image => {
    apiFormData.append('pictures', image);
  });
  
  const response = await fetch('/api/market/listings', {
    method: 'POST',
    body: apiFormData,
    // No Content-Type header as browser sets it with boundary for FormData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error creating listing');
  }
  
  return response.json();
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
  const apiFormData = new FormData();
  
  // Add any updated fields
  if (formData.title) apiFormData.append('title', formData.title.trim());
  if (formData.description) apiFormData.append('description', formData.description.trim());
  
  if (formData.priceInCents) {
    const priceInCents = Math.round(parseFloat(formData.priceInCents) * 100);
    apiFormData.append('priceInCents', priceInCents.toString());
  }
  
  if (formData.country) apiFormData.append('countries[]', formData.country);
  
  // Handle image updates if provided
  if (imageIndexesToKeep && imageIndexesToKeep.length > 0) {
    imageIndexesToKeep.forEach(index => {
      apiFormData.append('pictures[]', index.toString());
    });
  }
  
  // Add new images if provided
  if (newImages && newImages.length > 0) {
    newImages.forEach(image => {
      apiFormData.append('newPictures', image);
    });
  }
  
  const response = await fetch(`/api/market/listings/${id}`, {
    method: 'PATCH',
    body: apiFormData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error updating listing');
  }
  
  return response.json();
}

/**
 * Delete a listing
 */
export async function deleteListing(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/market/listings/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error deleting listing');
  }
  
  return response.json();
}
