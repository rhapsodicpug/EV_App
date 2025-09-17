/**
 * Network Test Utility
 * Helps debug network connectivity issues
 */

import { API_CONFIG } from '../constants/config';

export const testNetworkConnection = async (): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> => {
  try {
    console.log('🔧 Testing network connection...');
    console.log('🔧 Base URL:', API_CONFIG.BASE_URL);
    console.log('🔧 Full login URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`);
    
    // Test basic connectivity
    const response = await fetch(`${API_CONFIG.BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Basic connectivity test passed:', data);
    
    // Test login endpoint
    const loginResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123',
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login endpoint HTTP ${loginResponse.status}: ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login endpoint test passed:', loginData);
    
    return {
      success: true,
      details: {
        baseUrl: API_CONFIG.BASE_URL,
        loginUrl: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
        basicTest: data,
        loginTest: loginData,
      },
    };
  } catch (error: any) {
    console.error('❌ Network test failed:', error);
    return {
      success: false,
      error: error.message,
      details: {
        baseUrl: API_CONFIG.BASE_URL,
        loginUrl: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
        error: error.message,
        stack: error.stack,
      },
    };
  }
};

export const logNetworkInfo = () => {
  console.log('🔧 Network Configuration:');
  console.log('  Base URL:', API_CONFIG.BASE_URL);
  console.log('  Login Endpoint:', API_CONFIG.ENDPOINTS.AUTH.LOGIN);
  console.log('  Full Login URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`);
  console.log('  Timeout:', API_CONFIG.TIMEOUT);
  console.log('  Environment:', __DEV__ ? 'Development' : 'Production');
};
