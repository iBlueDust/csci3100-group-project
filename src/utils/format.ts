const currencyFormatter = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})

export function formatCurrency(cents: number, currency: string = 'USD') {
	return `${currency} ${currencyFormatter.format(cents / 100)}`
}


const numberFormatter = new Intl.NumberFormat('en-US')
// Format number with commas
export function formatNumber(num: number): string {
	return numberFormatter.format(num)
}