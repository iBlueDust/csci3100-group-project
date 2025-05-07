import fs from 'fs'
import path from 'path'


const licenseFileContents = fs.readFileSync(
	path.join(__dirname, '../../../../.licenses'),
	{ encoding: 'utf-8' },
)

export const isLicenseKey = (key: string): boolean => {

	return /^(?:[A-HJ-NP-Z2-9]{4}-){3}[A-HJ-NP-Z2-9]{4}$/.test(key)
}

const licenseList = licenseFileContents
	.split('\n')
	.map((key) => key.trim())
	.filter(isLicenseKey)

const licenseRepo = new Set(licenseList)

export function isValidLicenseKey(key: string) {
	return isLicenseKey(key) && licenseRepo.has(key)
}

