// jest.polyfills.ts
import { TextEncoder, TextDecoder } from 'util'

// @ts-ignore
global.TextEncoder = TextEncoder
// @ts-ignore
global.TextDecoder = TextDecoder
