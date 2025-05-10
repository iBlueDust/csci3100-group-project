// Types related to market listings

export interface ListingFormData {
  title: string
  description: string
  priceInCents: number
  pictures: (string | File)[]
  category: string
  countries: string[]
}

export interface Listing extends Omit<ListingFormData, 'priceInCents'> {
  id: string
  priceInCents: number
  images: string[]
  seller: {
    id: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

export interface ListingFilters {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  countries?: string[]
}

export interface ListingApiResponse {
  data: Listing[]
  meta: {
    total: number
    skip: number
    limit: number
  }
}

export interface CategoryOption {
  id: string
  name: string
}
