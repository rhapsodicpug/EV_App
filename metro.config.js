const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the frontend directory to the resolver
config.resolver.alias = {
  ...config.resolver.alias,
  '@': path.resolve(__dirname, 'frontend/src'),
};

// Add the frontend directory to the watchFolders
config.watchFolders = [
  path.resolve(__dirname, 'frontend'),
];

// Ensure the frontend directory is included in the resolver
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
