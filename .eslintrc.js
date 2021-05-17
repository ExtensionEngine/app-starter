'use strict';

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: '@extensionengine',
  rules: {
    'vue/component-definition-name-casing': ['error', 'kebab-case']
  }
};
