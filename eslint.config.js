const expoConfig = require('eslint-config-expo/flat');
const { defineConfig } = require('eslint/config');
const checkFile = require('eslint-plugin-check-file');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const testingLibrary = require('eslint-plugin-testing-library');

module.exports = defineConfig([
  {
    ignores: [
      '.expo/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'android/**',
      'ios/**',
      'expo-env.d.ts',
    ],
  },
  expoConfig,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'check-file': checkFile,
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    rules: {
      quotes: [2, 'single', { avoidEscape: true }],
      'max-len': [
        2,
        {
          code: 120,
          ignoreUrls: true,
          ignorePattern: '^(import|export) \\{(.*?)\\}',
        },
      ],
      'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'max-params': ['error', 3],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@testing-library/react-native'],
              message: 'Please import from `@/test/test-utils` instead.',
            },
            {
              group: ['react-native'],
              importNames: ['ActivityIndicator'],
              message: 'Please import from `@/ui` instead.',
            },
          ],
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/!(__mocks__)/': 'KEBAB_CASE',
          'test/**/!(__mocks__)/': 'KEBAB_CASE',
        },
      ],
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{js,ts,jsx,tsx}': 'KEBAB_CASE',
          '**/test/**': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
          errorMessage:
            'The file "{{ target }}" does not match file naming convention defined("{{ pattern }}") ' +
            'for this project, see rules-conventions.md for details',
        },
      ],
    },
  },
  {
    // `eslint-config-expo` only registers the @typescript-eslint plugin for TS
    // files, so a rule from it must be scoped the same way — applying it to
    // every file makes ESLint fail on the JS configs at the repo root.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Packages `react` related packages come first.
            ['^react', '^@?\\w'],
            // Internal packages.
            ['^(@|components)(/.*|$)'],
            // Side effect imports.
            ['^\\u0000'],
            // Parent imports. Put `..` last.
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports. Put same-folder imports and `.` last.
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports.
            ['^.+\\.?(css)$'],
          ],
        },
      ],
    },
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    extends: [testingLibrary.configs['flat/react']],
    rules: {
      // RNTL 14 made fireEvent async; the rule still assumes the v12 sync API.
      'testing-library/no-await-sync-events': 'off',
    },
  },
  {
    files: ['src/app/**/*', 'test/**/*'],
    rules: {
      'check-file/folder-naming-convention': 'off',
      'check-file/filename-naming-convention': 'off',
    },
  },
  {
    files: ['test/**/*', 'src/ui/**/*'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]);
