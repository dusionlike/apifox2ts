const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  extends: ['@sxzz/eslint-config'],
  rules: {
    '@typescript-eslint/no-namespace': 'off',
  },
})
