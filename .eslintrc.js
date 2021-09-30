'use strict';

module.exports = {
  root: true,
  extends: ['@extensionengine/eslint-config/base'],
  plugins: ['jest'],
  env: {
    'jest/globals': true
  },
  overrides: [{
    files: ['*.ts'],
    parser: '@typescript-eslint/parser',
    extends: ['plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint'],
    rules: {
      strict: 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }]
};
