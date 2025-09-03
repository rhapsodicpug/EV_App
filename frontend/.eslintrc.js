module.exports = {
  extends: [
    '@expo/eslint-config-base',
    '@react-native-community',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-native'],
  env: {
    'react-native/react-native': true,
  },
  rules: {
    // Customize rules as needed
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react-native/no-inline-styles': 'warn',
    'react-native/split-platform-components': 'error',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
