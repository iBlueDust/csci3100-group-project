export type PaginationOptions<T = object> = {
	limit: number
	skip: number
} & T

export type PaginatedResult<TData, TMeta = object> = {
	data: TData[]
	meta: {
		total: number
		skip: number
		limit: number
	} & TMeta
}

export interface Error {
	code: string
	message?: string
}