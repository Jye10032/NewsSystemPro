module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'coverage', 'node_modules'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
    'react/display-name': 'warn',
    // 允许未使用的变量（以下划线开头）
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_|^res$|^err$',
      varsIgnorePattern: '^_|^React$',
      caughtErrorsIgnorePattern: '^_'
    }],
    // React 18 不需要显式导入 React
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      // 测试文件特殊规则
      files: ['**/*.test.js', '**/*.test.jsx', '**/test/**/*.js'],
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly'
      },
      rules: {
        'no-unused-vars': 'off', // 测试文件中允许未使用的变量
        'no-undef': 'off', // 测试文件中允许全局变量
      }
    }
  ]
}
