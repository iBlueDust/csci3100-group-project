// jest.api.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest'

// We still want Next’s TS support for our pages/api handlers
const createConfig = nextJest({ dir: './' })

const config: Config = {
  displayName: 'api',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/api/**/*.test.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  moduleFileExtensions: ['ts','js','json','node'],
  // you don’t need browser polyfills here
}

export default createConfig(config)
