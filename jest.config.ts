// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest'

// make sure this file actually lives at <rootDir>/jest.polyfills.ts
// with your TextEncoder/TextDecoder and fetch shims in it
const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  // run this before any of your tests to polyfill window.crypto, etc.
  setupFiles: ['<rootDir>/jest.polyfills.ts'],

  // run this after Jest's env is set up (for custom matchers, etc.)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // we need `window` for your e2e tests
  testEnvironment: 'jsdom',

  // Jest defaults
  clearMocks: true,
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',

  // allow `@/...` imports to resolve into src/
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: [
    'ts', 'tsx', 'js', 'jsx', 'json', 'node'
  ],
}

export default createJestConfig(config)
