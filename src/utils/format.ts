const currencyFormatter = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})

export function formatCurrency(cents: number, currency: string = 'USD') {
	return `${currency} ${currencyFormatter.format(cents / 100)}`
}

const log = (x: number, base: number) => Math.log(x) / Math.log(base)
/**
 * Format bytes into a human-readable string. Based on 1000 bytes = 1 KB.
 */
export function formatBytes(numBytes: number, decimals: number = 1): string {
	if (numBytes === 0) return '0 bytes'

	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
	const index = Math.floor(log(numBytes, 1000))
	const unit = sizes[index]
	return `${parseFloat((numBytes / Math.pow(1000, index)).toFixed(dm))} ${unit}`
}

const numberFormatter = new Intl.NumberFormat('en-US')
// Format number with commas
export function formatNumber(num: number): string {
	return numberFormatter.format(num)
}

export function formatTruncatedList(list: string[], maxLength: number): string {
	if (list.length <= maxLength) {
		return list.join(', ')
	}
	const truncatedList = list.slice(0, maxLength - 1).join(', ')
	return `${truncatedList}, + ${list.length - maxLength + 1} more`
}