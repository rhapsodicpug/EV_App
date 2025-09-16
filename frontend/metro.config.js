const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Web-specific resolver to exclude react-native-maps
config.resolver.platforms = ['web', 'native', 'ios', 'android'];
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-maps': require.resolve('./src/components/maps/EnhancedMap.tsx'),
};

// Exclude react-native-maps from web builds
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Disable cache to prevent InternalBytecode.js errors
config.resetCache = true;
config.cacheStores = [];

// Disable symbolication to prevent InternalBytecode.js errors
config.symbolicateInPlace = false;

module.exports = config;
