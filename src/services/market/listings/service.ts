import mongoose from 'mongoose'
import env from '@/env'
import minioClient, { putManyObjects } from '@/data/db/minio'
import dbConnect from '@/data/db/mongo'
import MarketListing from '@/data/db/mongo/models/market-listing'
import { searchMarketListings } from '@/data/db/mongo/queries/market/searchMarketListings'
import { generatePictureObjectName, patchPictureArrayAllUnique, patchPictureArrayUnusedPictures, patchPictureArrayUsesAllNewPictures, patchPictureArrayWithinBounds } from '@/utils/api/market'
import { getMarketListingById } from '@/data/db/mongo/queries/market/getMarketListingById'
import { makeMarketListingClientFriendly } from '@/data/db/mongo/queries/market'
import type formidable from 'formidable'
type FileInfo = formidable.File

import {
    createListingSchema,
    getListingByIdSchema,
    updateListingSchema,
    deleteListingSchema,
    getListingsSchema
} from './validators'

import type {
    CreateListingData,
    CreateListingResult,
    DeleteListingData,
    DeleteListingResult,
    GetListingByIdResult,
    GetListingsOptions,
    SearchListingsResult,
    UpdateListingData,
    UpdateListingResult
} from './types'

/**
 * Gets market listings with filtering, pagination, and searching
 */
export async function getListings(options: GetListingsOptions): Promise<SearchListingsResult> {
    // Validate input
    const { value: validatedOptions, error } = getListingsSchema.validate(options)
    if (error) {
        throw new Error(`Invalid options: ${error.message}`)
    }

    // Connect to database
    await dbConnect()

    // Search for listings
    const listings = await searchMarketListings({
        ...validatedOptions,
    })

    // Transform picture URLs
    for (const listing of listings.data) {
        listing.pictures = listing.pictures.map(
            (pictureObjectName: string) =>
                `${env.MINIO_PUBLIC_ENDPOINT || 'localhost:9000'}/`
                + `${env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS}/`
                + `${pictureObjectName.toString()}`
        )
    }

    return listings
}

/**
 * Creates a new market listing with associated pictures
 */
export async function createListing(data: CreateListingData): Promise<CreateListingResult> {
    // Validate input
    const { value: validatedData, error } = createListingSchema.validate(data)
    if (error) {
        throw new Error(`Invalid listing data: ${error.message}`)
    }

    // Prepare files for upload
    const filesToUpload = (validatedData.pictures).map((picture: File) => ({
        ...picture,
        name: generatePictureObjectName({ info: picture.info }),
    }))

    // Upload pictures
    const uploadedAt = new Date().toISOString()
    const uploadResults = await putManyObjects(
        minioClient,
        env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS,
        filesToUpload.map(({ name, data, info }: { name: string, data: Buffer, info: FileInfo }) => {
            return {
                name,
                data,
                maxSize: env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT,
                metadata: {
                    originalFilename: info.originalFilename,
                    mimetype: info.mimetype,
                    uploadedAt,
                    uploadedBy: validatedData.userId,
                }
            }
        }),
    )

    if (!uploadResults.success) {
        throw new Error(`Error uploading pictures: ${uploadResults.failedObjects.join(', ')}`)
    }

    // Create listing in database
    await dbConnect()
    const listing = await MarketListing.create({
        title: validatedData.title,
        description: validatedData.description,
        pictures: filesToUpload.map(({ name }: { name: string }) => name),
        author: new mongoose.Types.ObjectId(validatedData.userId),
        priceInCents: validatedData.priceInCents,
        countries: validatedData.countries,
    })

    return { id: listing.id }
}

/**
 * Gets a specific market listing by ID
 */
export async function getListing(id: string): Promise<GetListingByIdResult> {
    // Validate input
    const { error } = getListingByIdSchema.validate(id)
    if (error) {
        throw new Error(`Invalid ID: ${error.message}`)
    }

    // Convert to ObjectId
    let listingId: mongoose.Types.ObjectId
    try {
        listingId = new mongoose.Types.ObjectId(id)
    } catch {
        throw new Error('Invalid market listing ID')
    }

    // Retrieve the listing
    await dbConnect()
    const listing = await getMarketListingById(listingId)

    if (!listing) {
        throw new Error('Market listing not found')
    }

    // Transform picture URLs
    listing.pictures = listing.pictures.map(
        (pictureObjectName: string) =>
            `${env.MINIO_PUBLIC_ENDPOINT}/`
            + `${env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS}/`
            + `${pictureObjectName.toString()}`
    )

    return listing
}

/**
 * Updates a market listing
 */
export async function updateListing(data: UpdateListingData): Promise<UpdateListingResult> {
    // Validate input
    const { value: validatedData, error } = updateListingSchema.validate(data)
    if (error) {
        throw new Error(`Invalid update data: ${error.message}`)
    }

    // Convert to ObjectId
    let listingId: mongoose.Types.ObjectId
    try {
        listingId = new mongoose.Types.ObjectId(validatedData.listingId)
    } catch {
        throw new Error('Invalid market listing ID')
    }

    // Get the existing listing
    await dbConnect()
    const listing = await MarketListing.findOne({
        _id: listingId,
        author: validatedData.userId,
    })

    if (!listing) {
        throw new Error('Market listing not found')
    }

    // Handle picture updates if needed
    if (validatedData.pictures) {
        const numOldPics = listing.pictures.length
        const numNewPics = validatedData.newPictures?.length ?? 0

        // Validate picture array bounds
        if (!patchPictureArrayWithinBounds(validatedData.pictures, numOldPics, numNewPics)) {
            throw new Error('Picture index out of bounds')
        }
        // Make sure all new pictures are used
        if (!patchPictureArrayUsesAllNewPictures(validatedData.pictures, numNewPics)) {
            throw new Error('Not all new pictures are used')
        }

        // Check for duplicates
        if (!patchPictureArrayAllUnique(validatedData.pictures, numOldPics, numNewPics)) {
            throw new Error('Duplicate picture index')
        }

        // Handle new picture uploads
        if (validatedData.newPictures && validatedData.newPictures.length > 0) {
            const newPictures = validatedData.newPictures
            const newPictureObjectNames = newPictures.map(generatePictureObjectName)

            // Upload new pictures to MinIO
            const uploadedAt = new Date().toISOString()
            const uploadResults = await putManyObjects(
                minioClient,
                env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS,
                newPictures.map(({ data, info }: { data: Buffer, info: FileInfo }, index: number) => {
                    const objectName = newPictureObjectNames[index]
                    return {
                        name: objectName,
                        data,
                        maxSize: env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT,
                        metadata: {
                            originalFilename: info.originalFilename,
                            mimetype: info.mimetype,
                            listingId: listingId.toString(),
                            uploadedAt,
                            uploadedBy: validatedData.userId.toString(),
                        },
                    }
                }),
            )

            if (!uploadResults.success) {
                throw new Error(`Error uploading pictures: ${uploadResults.failedObjects.join(', ')}`)
            }

            // Delete pictures that are now unused
            const picturesToDelete = patchPictureArrayUnusedPictures(
                validatedData.pictures, numOldPics, numNewPics
            ).filter(index => index >= 0)
                .map((index) => listing.pictures[index])

            try {
                await Promise.all(
                    picturesToDelete.map((objectName) =>
                        minioClient.removeObject(env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS, objectName)
                    )
                )
            } catch (err) {
                console.error('Error deleting pictures:', err)
                // Non-critical error, continue with update
            }

            // Update the pictures array
            listing.pictures = validatedData.pictures.map((index: number) => {
                if (index < 0) {
                    const newIndex = -index - 1
                    return newPictureObjectNames[newIndex]
                } else {
                    return listing.pictures[index]
                }
            })
        }
    }
    // Update other fields if provided
    if (validatedData.title) listing.title = validatedData.title.trim()
    if (validatedData.description) listing.description = validatedData.description.trim()
    if (validatedData.priceInCents) listing.priceInCents = validatedData.priceInCents
    if (validatedData.countries) listing.countries = validatedData.countries

    // Set edited timestamp
    listing.editedAt = new Date()

    // Save the changes
    await listing.save()

    // Return the updated listing
    const listingJson = makeMarketListingClientFriendly(listing.toJSON())
    listingJson.pictures = listingJson.pictures.map(picture =>
        `${env.MINIO_PUBLIC_ENDPOINT}/`
        + `${env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS}/`
        + `${picture.toString()}`
    )

    return listingJson
}

/**
 * Deletes a market listing
 */
export async function deleteListing(data: DeleteListingData): Promise<DeleteListingResult> {
    // Validate input
    const { value: validatedData, error } = deleteListingSchema.validate(data)
    if (error) {
        throw new Error(`Invalid delete data: ${error.message}`)
    }

    // Convert to ObjectId
    let listingId: mongoose.Types.ObjectId
    try {
        listingId = new mongoose.Types.ObjectId(validatedData.listingId)
    } catch {
        throw new Error('Invalid market listing ID')
    }

    // Delete the listing
    await dbConnect()
    const result = await MarketListing.deleteOne({
        _id: listingId,
        author: validatedData.userId,
    })

    if (result.deletedCount === 0) {
        throw new Error('Market listing not found')
    }

    return { success: result.deletedCount > 0 }
}