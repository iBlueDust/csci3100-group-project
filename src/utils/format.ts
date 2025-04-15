export function formatCurrency(cents: number, currency: string = 'USD') {
	const formatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
	return `${currency} ${formatter.format(cents / 100)}`
}