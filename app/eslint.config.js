const eslintJs = require('@eslint/js')
const globals = require('globals')
const vue = require('eslint-plugin-vue')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = [
  ...vue.configs['flat/essential'],
  eslintJs.configs.recommended,
  {
    files: ['**/*.{js,cjs,mjs,vue}'],
    languageOptions: {
      ecmaVersion: 2026,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'vue/multi-word-component-names': isProduction ? 'warn' : 'off',
      'vue/no-v-text-v-html-on-component': isProduction ? 'warn' : 'off',
      'vue/no-mutating-props': isProduction ? 'warn' : 'off',
      'no-console': isProduction ? 'warn' : 'off',
      'no-debugger': isProduction ? 'warn' : 'off',
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      'no-useless-assignment': 'off'
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly'
      }
    }
  }
]
