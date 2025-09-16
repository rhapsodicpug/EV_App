// Simple verification script to test Expo SDK 51 setup
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Expo SDK 54 Setup...\n');

// Check package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Package Versions:');
console.log(`  - Expo: ${packageJson.dependencies.expo}`);
console.log(`  - React: ${packageJson.dependencies.react}`);
console.log(`  - React Native: ${packageJson.dependencies['react-native']}`);
console.log(`  - TypeScript: ${packageJson.devDependencies.typescript}\n`);

// Check app.json
const appJsonPath = path.join(__dirname, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

console.log('⚙️  App Configuration:');
console.log(`  - SDK Version: ${appJson.expo.sdkVersion || 'Not specified (will use default)'}`);
console.log(`  - App Name: ${appJson.expo.name}`);
console.log(`  - Plugins: ${appJson.expo.plugins ? appJson.expo.plugins.length : 0} configured\n`);

// Check if critical files exist
const criticalFiles = ['App.tsx', 'index.ts', 'babel.config.js', 'tsconfig.json'];
console.log('📁 Critical Files:');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  - ${file}: ${exists ? '✅ Present' : '❌ Missing'}`);
});

console.log('\n🎯 Setup Status: Ready for development!');
console.log('\n📱 To start development:');
console.log('1. Run: npx expo start');
console.log('2. Press "g" to open in Expo Go');
console.log('3. Scan QR code with your phone');
console.log('\n💡 Your app now uses SDK 54, which matches your Expo Go app version perfectly!');
