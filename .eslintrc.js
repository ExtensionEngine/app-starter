'use strict';

module.exports = {
  root: true,
  extends: '@extensionengine',
  plugins: ['jest'],
  env: {
    'jest/globals': true
  },
  rules: {
    'vue/component-definition-name-casing': ['error', 'kebab-case']
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
