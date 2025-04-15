/**
 * Code was derived from Topaco's excellent post
 * https://stackoverflow.com/a/79280240
 */

import { ab2hex, hex2ab } from "@/utils"
import { HashAlgorithm } from "./hash"

// const curve = 'P-256'
// const orderHex = 'ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551' // P-256
// const prefixHex = '3041020100301306072a8648ce3d020106082a8648ce3d030107042730250201010420' // P-256
//----------------------------------------------------------------------------------------------------------------------------
//const curve = 'P-384'
//const orderHex = 'ffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973' // P-384
//const prefixHex = '304e020100301006072a8648ce3d020106052b81040022043730350201010430' // P-384
//----------------------------------------------------------------------------------------------------------------------------
const curve = 'P-521'
const orderHex = '01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409' // P-521
const p521Pkcs8Header = hex2ab('3060020100301006072a8648ce3d020106052b81040023044930470201010442') // P-521
//----------------------------------------------------------------------------------------------------------------------------
const size = hex2ab(orderHex).byteLength * 8
const kdfHash = HashAlgorithm.SHA256
const kdfIterations = 100000

const textEncoder = new TextEncoder()

export async function generateDeterministicKeyPair(
	secret: string,
	salt: string,
): Promise<CryptoKeyPair> {
	const secretBytes = textEncoder.encode(secret)
	const saltBytes = textEncoder.encode(salt)
	// derive raw private key via PBKDF2
	const secretKey = await crypto.subtle.importKey(
		'raw',
		secretBytes,
		{ name: 'PBKDF2' },
		false,
		['deriveBits']
	)

	const rawPrivateEcKeyAB = await deriveRawPrivate(saltBytes, secretKey)

	// convert to PKCS#8 since the public exponent is not mandatory in PKCS#8
	const privateKeyPkcs8 = ecRawPrivateKey2pcks8(rawPrivateEcKeyAB)
	const privateKey = await crypto.subtle.importKey(
		'pkcs8',
		privateKeyPkcs8,
		{ name: 'ECDH', namedCurve: curve },
		true,
		['deriveBits']
	)
	// get public key 
	const publicKey = await getPublic(privateKey)
	return { publicKey, privateKey }
}

/**
 * Convert a raw private ECDH key to PKCS#8 format.
 */
function ecRawPrivateKey2pcks8(rawPrivateEcKey: ArrayBuffer): Uint8Array {
	return new Uint8Array([
		...new Uint8Array(p521Pkcs8Header),
		...new Uint8Array(rawPrivateEcKey)
	])
}

async function deriveRawPrivate(
	saltAB: Uint8Array<ArrayBufferLike>,
	passphraseCK: CryptoKey,
): Promise<ArrayBuffer> {
	const rawKeyAB = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt: saltAB, iterations: kdfIterations, hash: kdfHash },
		passphraseCK,
		size
	)
	const nBI = BigInt('0x' + orderHex)
	let rawKeyBI = BigInt('0x' + ab2hex(rawKeyAB))
	if (rawKeyBI >= nBI) { // if derived rawKey greater than/equal to order n...
		rawKeyBI = rawKeyBI % nBI // ...compute rawKey mod n         
	}
	const rawKeyHex = rawKeyBI.toString(16).padStart(2 * (size / 8), '0') // if shorter, pad with 0x00 to fixed size
	return hex2ab(rawKeyHex)
}

async function getPublic(privateKeyCK: CryptoKey) {
	const jwk = await crypto.subtle.exportKey('jwk', privateKeyCK)

	// Turn to public key
	delete jwk.d
	jwk.key_ops = []

	return crypto.subtle.importKey(
		'jwk',
		jwk, // jwk is not a public key
		{ name: 'ECDH', namedCurve: curve },
		true,
		[],
	)
}

// // Use case: Calculate shared secrets for ECDH -----------------------------------------------------------

// // 1a. Determinstic key generation, A side
// const keysA = await generateDeterministicKeyPair('a passphrase for A side', 'some salt for A')
// // 1b. Determinstic key generation, B side
// const keysB = await generateDeterministicKeyPair('a passphrase for B side', 'some salt for B')

// // 2. exchange public keys

// // 3a. key import, A side

// // 4a. calculate shared secret, A side
// const sharedSecretA = await window.crypto.subtle.deriveBits({ name: 'ECDH', public: keysB.publicKey }, keysA.privateKey, size)
// // 4b. calculate shared secret, B side
// const sharedSecretB = await window.crypto.subtle.deriveBits({ name: 'ECDH', public: keysA.publicKey }, keysA.privateKey, size)

// console.log('Shared secret, A:', ab2hex(sharedSecretA))
// console.log('Shared secret, B:', ab2hex(sharedSecretB))
