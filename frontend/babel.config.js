module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Support for export namespace from
      '@babel/plugin-transform-export-namespace-from',
      // Support for optional chaining
      '@babel/plugin-transform-optional-chaining',
      // Support for nullish coalescing
      '@babel/plugin-transform-nullish-coalescing-operator',
    ],
  };
};
