import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  coverageProvider: 'babel',
  testEnvironment: 'jsdom',
  clearMocks: true,
  testMatch: ['**/*.test.js', '**/*.test.ts', '**/*.test.jsx', '**/*.test.tsx'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    'src/helpers/**/*.{ts,tsx}',
    'src/views/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  setupFilesAfterEnv: ['./test/jest.setup.ts'],
  testPathIgnorePatterns: ['./node_modules/', './.expo/', '/test/', '/public/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};

export default config;
