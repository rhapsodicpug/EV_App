const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Add any modules that need to be transpiled
        ],
      },
    },
    argv
  );

  // Exclude react-native-maps and related native modules from web builds
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-maps': require.resolve('./src/components/maps/EnhancedMap.tsx'),
    'react-native-maps-clustering': false,
  };

  // Add fallbacks for native modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'react-native-maps': require.resolve('./src/components/maps/EnhancedMap.tsx'),
  };

  return config;
};
