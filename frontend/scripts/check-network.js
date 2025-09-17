#!/usr/bin/env node

/**
 * Network Check Script
 * Helps diagnose network connectivity issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get current IP address
function getCurrentIP() {
  try {
    const result = execSync('hostname -I', { encoding: 'utf8' });
    const ips = result.trim().split(' ');
    return ips[0];
  } catch (error) {
    console.error('❌ Error getting IP address:', error.message);
    return null;
  }
}

// Check if port is accessible
function checkPort(ip, port) {
  try {
    execSync(`nc -z ${ip} ${port}`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if backend is running
function checkBackend() {
  try {
    const result = execSync('ps aux | grep python | grep uvicorn', { encoding: 'utf8' });
    return result.includes('uvicorn');
  } catch (error) {
    return false;
  }
}

// Test API endpoint
async function testAPI(ip, port) {
  try {
    const response = await fetch(`http://${ip}:${port}/`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main function
async function main() {
  console.log('🔧 Network Diagnostic Tool');
  console.log('========================\n');

  // Get current IP
  const currentIP = getCurrentIP();
  console.log(`📍 Current IP Address: ${currentIP || 'Could not determine'}`);

  // Check backend process
  const backendRunning = checkBackend();
  console.log(`🖥️  Backend Process: ${backendRunning ? '✅ Running' : '❌ Not Running'}`);

  if (currentIP) {
    // Check port accessibility
    const portAccessible = checkPort(currentIP, 8000);
    console.log(`🔌 Port 8000 Accessible: ${portAccessible ? '✅ Yes' : '❌ No'}`);

    // Test API endpoint
    const apiWorking = await testAPI(currentIP, 8000);
    console.log(`🌐 API Endpoint: ${apiWorking ? '✅ Working' : '❌ Not Working'}`);
  }

  // Check config file
  const configPath = path.join(__dirname, '..', 'src', 'constants', 'config.ts');
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const ipMatch = configContent.match(/http:\/\/(\d+\.\d+\.\d+\.\d+):8000/);
    if (ipMatch) {
      const configIP = ipMatch[1];
      console.log(`⚙️  Config IP: ${configIP}`);
      console.log(`🔄 IP Match: ${configIP === currentIP ? '✅ Yes' : '❌ No'}`);
    }
  }

  console.log('\n💡 Recommendations:');
  if (!backendRunning) {
    console.log('  - Start the backend server: uvicorn main:app --reload --host 0.0.0.0 --port 8000');
  }
  if (currentIP && !checkPort(currentIP, 8000)) {
    console.log('  - Check firewall settings');
    console.log('  - Ensure port 8000 is not blocked');
  }
  if (currentIP) {
    const configPath = path.join(__dirname, '..', 'src', 'constants', 'config.ts');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const ipMatch = configContent.match(/http:\/\/(\d+\.\d+\.\d+\.\d+):8000/);
      if (ipMatch && ipMatch[1] !== currentIP) {
        console.log('  - Update IP address in config: npm run update-ip');
      }
    }
  }
  console.log('  - Restart Expo server: npx expo start --clear');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getCurrentIP, checkPort, checkBackend, testAPI };
