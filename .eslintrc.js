module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'react/jsx-filename-extension': 0,
    'react/react-in-jsx-scope': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'no-nested-ternary': 0,
    'no-useless-catch': 0,
    'no-alert': 0,
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', '.'],
      },
    },
  },
};
