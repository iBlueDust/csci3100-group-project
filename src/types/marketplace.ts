// Types related to market listings

export interface ListingFormData {
  title: string;
  description: string;
  priceInCents: string;
  category: string;
  country: string;
}

export interface Listing extends Omit<ListingFormData, 'priceInCents'> {
  id: string;
  priceInCents: number;
  images: string[];
  seller: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilters {
  query?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  country?: string;
}

export interface ListingApiResponse {
  data: Listing[];
  meta: {
    total: number;
    skip: number;
    limit: number;
  };
}

export interface CategoryOption {
  id: string;
  name: string;
}
