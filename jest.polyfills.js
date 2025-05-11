// jest.polyfills.js

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { webcrypto } = require('crypto');
globalThis.crypto = webcrypto;
if (typeof window !== 'undefined') {
  window.crypto = webcrypto;
  window.crypto.subtle = webcrypto.subtle;
}
if (typeof global !== 'undefined') global.crypto = webcrypto;

const fetch = require('cross-fetch');
global.fetch = fetch;

if (!globalThis.self) {
  globalThis.self = globalThis;
}