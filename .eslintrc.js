module.exports = {
  plugins: ['require-sort', 'simple-import-sort'],
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: 'standard',
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    },
    {
      files: ['*.js', '*.ts'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              ['^\\u0000'],
              // Internal packages.
              ['^controllers(/.*|$)'],
              ['^middleware(/.*|$)'],
              ['^models(/.*|$)'],
              ['^public(/.*|$)'],
              ['^routes(/.*|$)'],
              ['^utils(/.*|$)'],
              ['^views(/.*|$)'],
              // Side effect imports.
              // Parent imports. Put `..` last.
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Other relative imports. Put same-folder imports and `.` last.
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              // images imports
              ['^.+\\.(svg|jpg|png)$'],
              // Style imports.
              ['^.+\\.?(css)$']
            ]
          }
        ]
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'comma-dangle': 'off',
    'no-unexpected-multiline': 'off',
    quotes: ['off'],
    semi: 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'prefer-promise-reject-errors': 'off'
  }
};
