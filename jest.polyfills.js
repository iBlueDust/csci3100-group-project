// // jest.polyfills.ts
// import { TextEncoder, TextDecoder } from 'util'

// // @ts-ignore
// global.TextEncoder = TextEncoder
// // @ts-ignore
// global.TextDecoder = TextDecoder


// // jest.polyfills.js
// // Ensure TextEncoder and TextDecoder are available globally
// if (typeof global.TextEncoder === 'undefined') {
//   const { TextEncoder, TextDecoder } = require('util');
//   global.TextEncoder = TextEncoder;
//   global.TextDecoder = TextDecoder;
// }

// // only for your JSDOM / browser tests:
// if (typeof global.fetch !== 'function') {
//   // require node-fetch for fetch polyfill
//   const pkg = require('node-fetch')
//   global.fetch = typeof pkg === 'function' ? pkg : pkg.default
// }


// jest.polyfills.js

//
// 1) Provide TextEncoder / TextDecoder in Node
//
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

//
// 2) Hook up WebCrypto from Node’s built‐in crypto
//
const { webcrypto } = require('crypto')
if (typeof global.crypto !== 'object') {
  global.crypto = webcrypto
}
// jsdom also exposes `window`, so mirror it there too if present
if (typeof window === 'object' && typeof window.crypto !== 'object') {
  window.crypto = webcrypto
}

//
// 3) Polyfill fetch for your browser tests
//
const fetch = require('cross-fetch')
global.fetch = fetch

//
// 4) Some libs expect `self` in a browser context
//
if (!globalThis.self) {
  globalThis.self = globalThis
}