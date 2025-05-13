import fs from 'fs'
import path from 'path'

const licenseFileContents = fs.readFileSync(
	path.join(__dirname, '../../../../../.licenses'),
	{ encoding: 'utf-8' },
)

export const isLicenseKey = (key: string): boolean => {
	// Matches license keys in the format XXXX-XXXX-XXXX-XXXX
	// Avoid characters that look alike, such as 0, O, 1, and I
	return /^(?:[A-HJ-NP-Z2-9]{4}-){3}[A-HJ-NP-Z2-9]{4}$/.test(key)
}

const licenseList = licenseFileContents
	.split('\n')
	.map((key) => key.trim())
	.filter(isLicenseKey)

console.log(`${licenseList.length} license keys loaded`)
const licenseRepo = new Set(licenseList)

export function isValidLicenseKey(key: string) {
	return isLicenseKey(key) && licenseRepo.has(key)
}

