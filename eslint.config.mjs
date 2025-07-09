import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  ignores: [
    '**/output',
    '**/.spago',
    '**/.psci_modules',
  ],
  rules: {
    'style/max-len': [
      'error',
      {
        code: 120,
      },
    ],
  },
})
