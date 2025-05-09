import { isDev } from "@/env"
import mongoose from "mongoose"

const MarketListingSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},

	description: {
		type: String,
		required: true,
	},

	pictures: {
		type: [String],
		required: true,
		default: [],
	},

	author: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true,
	},

	listedAt: {
		type: Date,
		default: Date.now,
		index: true,
	},

	editedAt: {
		type: Date,
	},

	priceInCents: {
		type: Number,
		required: true,
		index: true,
	},

	countries: {
		type: [String],
		required: true,
		index: true,
	},

	categories: {
		type: [String],
		default: [],
		index: true,
	}
})


MarketListingSchema.index(
	{ title: 'text', description: 'text' },
	{
		name: 'text_search_index',
		weights: { title: 5, description: 1 },
	}
)

function generateModel() {
	const MarketListing = mongoose.model('MarketListing', MarketListingSchema)

	if (isDev) {
		MarketListing.on('index', (err) => {
			if (err) {
				console.error('[DB] MarketListing index error: %s', err)
			} else {
				console.info('[DB] MarketListing indexing complete')
			}
		})
	}

	return MarketListing
}

const existingModel = mongoose.models.MarketListing as ReturnType<typeof generateModel>

export default existingModel ?? generateModel()