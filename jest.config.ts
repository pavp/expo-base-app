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
    'src/core/**/*.{ts,tsx}',
    'src/api/**/*.{ts,tsx}',
    'src/shared/**/*.{ts,tsx}',
    'src/ui/**/*.{ts,tsx}',
  ],
  coveragePathIgnorePatterns: ['node_modules', 'interfaces', '.mock.ts', 'index.ts', 'index.tsx', 'types.ts'],
  // Regression floor set a few points below measured coverage, so a real drop
  // fails while an ordinary refactor that shifts a few lines does not. Measured
  // at the time of writing: 83.73 branches, 92.44 functions, 94.65 lines,
  // 94.66 statements. Raise these when coverage rises; never lower them to make
  // a red run green.
  coverageThreshold: {
    global: {
      branches: 78,
      functions: 87,
      lines: 89,
      statements: 89,
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
