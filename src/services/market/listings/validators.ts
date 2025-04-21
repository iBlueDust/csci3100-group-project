import Joi from 'joi'
import env from '@/env'
import { joiFileSchema } from '@/utils/api/market'

export const getListingsSchema = Joi.object({
    query: Joi.string().optional(),
    countries: Joi.string().optional(),
    priceMin: Joi.number().min(0).optional(),
    priceMax: Joi.when(
        Joi.ref('priceMin'),
        {
            is: Joi.exist(),
            then: Joi.number().greater(Joi.ref('priceMin')),
            otherwise: Joi.allow(null),
        }
    ).optional(),
    skip: Joi.number().min(0).default(0),
    limit: Joi.number().min(1).max(100).default(30),
})

export const createListingSchema = Joi.object({
    // title must contain at least one non-whitespace character and be at most 
    // 200 characters long (after trimming)
    title: Joi.string()
        .pattern(
            new RegExp(
                `^\\s*\\S.{0,${env.MARKET_LISTING_TITLE_MAX_LENGTH - 1}}\\s*$`
            )
        )
        .required(),
    description: Joi.string()
        .pattern(
            new RegExp(
                `^\\s*\\S.{0,${env.MARKET_LISTING_DESCRIPTION_MAX_LENGTH - 1}}\\s*$`
            )
        )
        .required(),
    pictures: Joi.array()
        .items(joiFileSchema)
        .max(env.MARKET_LISTING_ATTACHMENT_LIMIT)
        .default([]),
    priceInCents: Joi.number().min(0).integer().required(),
    countries: Joi.array().items(Joi.string().pattern(/^[a-zA-Z]{2}$/)).default([]),
    userId: Joi.string().required(),
})

export const getListingByIdSchema = Joi.string().required()

export const updateListingSchema = Joi.object({
    listingId: Joi.string().required(),
    userId: Joi.any().required(),
    title: Joi.string()
        .pattern(
            new RegExp(
                `^\\s*\\S.{0,${env.MARKET_LISTING_TITLE_MAX_LENGTH - 1}}\\s*$`
            )
        )
        .optional(),
    description: Joi.string()
        .pattern(
            new RegExp(
                `^\\s*\\S.{0,${env.MARKET_LISTING_DESCRIPTION_MAX_LENGTH - 1}}\\s*$`
            )
        )
        .optional(),
    pictures: Joi.array()
        .items(Joi.number().integer().required())
        .max(env.MARKET_LISTING_ATTACHMENT_LIMIT)
        .optional(),
    newPictures: Joi.array()
        .items(joiFileSchema)
        .optional(),
    priceInCents: Joi.number().min(0).integer().optional(),
    countries: Joi.array()
        .items(Joi.string().pattern(/^[a-zA-Z]{2}$/))
        .optional()
})

export const deleteListingSchema = Joi.object({
    listingId: Joi.string().required(),
    userId: Joi.any().required()
})