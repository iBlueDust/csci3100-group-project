import type { File } from '@/utils/api'
import type { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import type { PaginatedResult } from '@/data/types/common'
import type mongoose from 'mongoose'

export interface GetListingsOptions {
    query?: string;
    countries?: string[];
    priceMin?: number;
    priceMax?: number;
    skip?: number;
    limit?: number;
}

export interface CreateListingData {
    title: string;
    description: string;
    pictures: File[];
    priceInCents: number;
    countries: string[];
    userId: string;
}

export interface CreateListingResult {
    id: string;
}

export interface SearchListingsResult extends PaginatedResult<MarketListingSearchResult> { }

export interface GetListingByIdResult extends MarketListingSearchResult { }

export interface UpdateListingData {
    listingId: string;
    userId: mongoose.Types.ObjectId;
    title?: string;
    description?: string;
    pictures?: number[];
    newPictures?: File[];
    priceInCents?: number;
    countries?: string[];
}

export interface UpdateListingResult extends MarketListingSearchResult { }

export interface DeleteListingData {
    listingId: string;
    userId: mongoose.Types.ObjectId;
}

export interface DeleteListingResult {
    success: boolean;
}