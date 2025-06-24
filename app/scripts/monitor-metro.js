#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to calculate directory size recursively
function getDirectorySize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  let totalSize = 0;
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(itemPath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

console.log('🚀 Metro Bundler Monitor');
console.log('========================');

// Check if Metro cache exists
const metroCachePath = path.join(__dirname, '..', '.metro-cache');
if (fs.existsSync(metroCachePath)) {
  const size = getDirectorySize(metroCachePath);
  console.log(`📁 Metro cache size: ${(size / 1024 / 1024).toFixed(2)} MB`);
} else {
  console.log('📁 Metro cache: Not found (will be created on first build)');
}

// Check node_modules size
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  const size = getDirectorySize(nodeModulesPath);
  console.log(`📦 node_modules size: ${(size / 1024 / 1024).toFixed(2)} MB`);
} else {
  console.log('📦 node_modules: Not found');
}

// Check package.json dependencies count
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const depCount = Object.keys(packageJson.dependencies || {}).length;
  const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
  console.log(`📋 Dependencies: ${depCount} production, ${devDepCount} development`);
}

console.log('\n💡 Tips for faster Metro bundling:');
console.log('   • Use --tunnel for better device connectivity');
console.log('   • Use --clear to clear cache when having issues');
console.log('   • Consider using --no-dev for production builds');
console.log('   • Monitor memory usage with htop or similar tools'); 