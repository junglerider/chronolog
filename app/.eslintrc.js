module.exports = {
  root: true,
  env: {
    node: true
  },
  overrides: [{
    files: ['tests/**/*.js'],
    globals: {
      describe: 'readonly',
      expect: 'readonly',
      it: 'readonly'
    }
  }],
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    'vue/multi-word-component-names': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-v-text-v-html-on-component': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-mutating-props': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
