module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Optimize React Native performance
      'react-native-reanimated/plugin',
      
      // Tree shaking for production builds
      process.env.NODE_ENV === 'production' && [
        'transform-remove-console',
        { exclude: ['error', 'warn'] }
      ],
    ].filter(Boolean),
  };
}; 