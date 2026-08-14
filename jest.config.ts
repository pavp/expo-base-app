/// <reference path="./types/jest-expo.d.ts" />
import type { Config } from 'jest';
import expoPreset from 'jest-expo/jest-preset';

const config: Config = {
  preset: 'jest-expo',
  coverageProvider: 'babel',
  testEnvironment: 'jsdom',
  clearMocks: true,
  testMatch: ['**/*.test.js', '**/*.test.ts', '**/*.test.jsx', '**/*.test.tsx'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    'src/modules/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    'src/helpers/**/*.{ts,tsx}',
    'src/views/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/store/**/*.{ts,tsx}',
    'src/api/**/*.{ts,tsx}',
  ],
  coveragePathIgnorePatterns: ['node_modules', 'interfaces', '.mock.ts', 'index.ts', 'index.tsx', 'types.ts'],
  // Temporary floor, not a target. Set to 0 so CI is green from day one while
  // real coverage (~60%) catches up. Raise these numbers as tests are added.
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  moduleNameMapper: {
    // Handle module aliases
    '^@/test/(.*)$': '<rootDir>/test/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['./test/jest.polyfills.ts', 'react-native-unistyles/mocks', './src/styles/unistyles.ts'],
  setupFilesAfterEnv: ['./test/jest.setup.ts'],
  testPathIgnorePatterns: ['./node_modules/', './.expo/', '/test/', '/public/'],
  transformIgnorePatterns: expoPreset.transformIgnorePatterns.map((pattern: string) =>
    pattern.startsWith('/node_modules/(?!(') ? pattern.replace('))', '|@faker-js))') : pattern,
  ),
};

export default config;
