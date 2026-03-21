export default [
  {
    files: ['public/scripts/**/*.js', 'public/lib/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        history: 'readonly',
        location: 'readonly',
        localStorage: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        TextEncoder: 'readonly',
        ArrayBuffer: 'readonly',
        DataView: 'readonly',
        Uint8Array: 'readonly',
        Uint32Array: 'readonly',
        setTimeout: 'readonly',
        URLSearchParams: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'eqeqeq': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'eqeqeq': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
];
