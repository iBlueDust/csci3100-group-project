// jest.e2e.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest'

// This will load your next.config.js, so you can import TS and @/… aliases
const createConfig = nextJest({ dir: './' })

const config: Config = {
  displayName: 'e2e',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/__tests__/e2e/**/*.test.ts'],
  setupFiles: ['<rootDir>/jest.polyfills.js'],        // only for the browser tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],    // e.g. @testing-library/jest-dom
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],
}

export default createConfig(config)
