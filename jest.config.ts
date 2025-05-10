import type { Config } from 'jest'
import nextJest from 'next/jest'

// Point next/jest at your Next.js app directory to load next.config.js and .env
const createJestConfig = nextJest({
  dir: './',
})

// Custom Jest configuration
const config: Config = {
 // 1. Polyfills (run before any code is imported)
  setupFiles: ['<rootDir>/jest.polyfills.ts'],

  // Setup files to be run after the test framework is installed
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  
  testEnvironment: "node",

  // Automatically clear mock calls, instances, contexts, and results before every test
  clearMocks: true,

  // Collect coverage and output to the coverage directory
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',

  // Map path aliases (e.g. @/src/*)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Recognize these extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}

// Export the wrapped config to ensure Next.js async config is loaded
export default createJestConfig(config)
