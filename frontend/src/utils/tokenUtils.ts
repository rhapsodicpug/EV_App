/**
 * Token Utilities
 * Helper functions for JWT token validation and management
 */

export interface TokenPayload {
  exp: number;
  iat: number;
  email?: string;
  sub?: string;
}

/**
 * Check if a JWT token is expired
 * @param token JWT token string
 * @param bufferSeconds Buffer time in seconds to account for network delays
 * @returns true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string, bufferSeconds: number = 30): boolean => {
  try {
    if (!token || typeof token !== 'string') {
      return true;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT token format');
      return true;
    }

    const payload = JSON.parse(atob(parts[1])) as TokenPayload;
    
    if (!payload.exp) {
      console.warn('Token does not contain expiration');
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < (currentTime + bufferSeconds);
    
    if (isExpired) {
      console.log(`🔑 Token expired: exp=${payload.exp}, current=${currentTime}`);
    }
    
    return isExpired;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Get token payload without verification
 * @param token JWT token string
 * @returns TokenPayload or null if invalid
 */
export const getTokenPayload = (token: string): TokenPayload | null => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    return JSON.parse(atob(parts[1])) as TokenPayload;
  } catch (error) {
    console.error('Error parsing token payload:', error);
    return null;
  }
};

/**
 * Get time until token expires
 * @param token JWT token string
 * @returns seconds until expiry, or 0 if expired/invalid
 */
export const getTokenTimeToExpiry = (token: string): number => {
  try {
    const payload = getTokenPayload(token);
    if (!payload?.exp) {
      return 0;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeToExpiry = payload.exp - currentTime;
    
    return Math.max(0, timeToExpiry);
  } catch (error) {
    console.error('Error calculating token time to expiry:', error);
    return 0;
  }
};

/**
 * Check if token will expire soon
 * @param token JWT token string
 * @param warningMinutes Minutes before expiry to warn
 * @returns true if token expires within warning period
 */
export const isTokenExpiringSoon = (token: string, warningMinutes: number = 5): boolean => {
  const timeToExpiry = getTokenTimeToExpiry(token);
  const warningSeconds = warningMinutes * 60;
  
  return timeToExpiry > 0 && timeToExpiry <= warningSeconds;
};

/**
 * Format time remaining until expiry
 * @param token JWT token string
 * @returns formatted string like "2h 30m" or "Expired"
 */
export const formatTokenTimeRemaining = (token: string): string => {
  const timeToExpiry = getTokenTimeToExpiry(token);
  
  if (timeToExpiry <= 0) {
    return 'Expired';
  }
  
  const hours = Math.floor(timeToExpiry / 3600);
  const minutes = Math.floor((timeToExpiry % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};