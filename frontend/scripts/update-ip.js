#!/usr/bin/env node

/**
 * Script to automatically update the API base URL with the current machine's IP address
 * Usage: node scripts/update-ip.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the current IP address
function getCurrentIP() {
  try {
    const result = execSync('hostname -I', { encoding: 'utf8' });
    const ips = result.trim().split(' ');
    // Return the first IP (usually the main network interface)
    return ips[0];
  } catch (error) {
    console.error('❌ Error getting IP address:', error.message);
    return '192.168.1.10'; // fallback
  }
}

// Update the config file
function updateConfigFile(ipAddress) {
  const configPath = path.join(__dirname, '..', 'src', 'constants', 'config.ts');
  
  try {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Replace the IP address in the BASE_URL
    const ipRegex = /http:\/\/\d+\.\d+\.\d+\.\d+:8000/;
    const newUrl = `http://${ipAddress}:8000`;
    
    if (ipRegex.test(content)) {
      content = content.replace(ipRegex, newUrl);
      fs.writeFileSync(configPath, content);
      console.log(`✅ Updated API base URL to: ${newUrl}`);
    } else {
      console.log('⚠️  Could not find IP address pattern in config file');
    }
  } catch (error) {
    console.error('❌ Error updating config file:', error.message);
  }
}

// Main execution
function main() {
  console.log('🔧 Updating API configuration...');
  
  const currentIP = getCurrentIP();
  console.log(`📍 Current IP address: ${currentIP}`);
  
  updateConfigFile(currentIP);
  
  console.log('🎉 Configuration updated successfully!');
  console.log('💡 Restart your Expo development server to apply changes.');
}

if (require.main === module) {
  main();
}

module.exports = { getCurrentIP, updateConfigFile };
