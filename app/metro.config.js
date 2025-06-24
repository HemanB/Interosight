const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');

// This is the new line you should add in, after the previous lines
config.resolver.unstable_enablePackageExports = false;

// Optimize for faster builds
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Enable Hermes for better performance
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Optimize asset handling
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Reduce bundle size by excluding unnecessary files
config.resolver.blockList = [
  /.*\/node_modules\/.*\/node_modules\/react-native\/.*/,
];

// Increase memory limits for large projects
config.maxWorkers = 2;
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Add watchman configuration for better file watching
config.watchFolders = [__dirname];

module.exports = config; 