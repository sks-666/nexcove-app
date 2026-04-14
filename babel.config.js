module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@app': './src',
            '@assets': './assets',
            '@common': './src/common',
            '@components': './src/components',
            '@containers': './src/containers',
            '@navigation': './src/navigation',
            '@redux': './src/redux',
            '@services': './src/services',
            '@selectors': './src/selectors',
            '@store': './src/store',
            '@utils': './src/utils',
            '@images': './src/images',
            '@ExpoCustom': './src/Expo',
            '@compat': './src/compat',
          },
          extensions: ['.js', '.jsx', '.json'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: [
          'transform-remove-console',
          [
            'babel-plugin-inline-import',
            {
              extensions: ['.svg'],
            },
          ],
        ],
      },
    },
  };
};
