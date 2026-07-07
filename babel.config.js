module.exports = function (api) {
  api.cache.using(() => require('react-native-reanimated/package.json').version);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      require('react-native-css-interop/dist/babel-plugin').default,
      [
        '@babel/plugin-transform-react-jsx',
        { runtime: 'automatic', importSource: 'react-native-css-interop' },
      ],
      require.resolve('react-native-reanimated/plugin'),
    ],
  };
};
