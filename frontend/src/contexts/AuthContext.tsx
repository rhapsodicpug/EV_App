import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthToken, UserLogin, UserRegistration } from '../types/api';
import { apiService } from '../services/api';
import { storageService } from '../services/StorageService';
import { STORAGE_KEYS } from '../constants/config';

// ==================== TYPES ====================

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  is2FAPending: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: '2FA_PENDING' };

interface AuthContextType extends AuthState {
  login: (credentials: UserLogin) => Promise<{ success: boolean; user: User; two_factor_required?: boolean }>;
  register: (userData: UserRegistration) => Promise<{ success: boolean; user: User }>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
  clearAuthData: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clear2FAPending: () => Promise<void>;
}

// ==================== REDUCER ====================

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null, is2FAPending: false };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
        is2FAPending: false,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload,
        is2FAPending: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
        is2FAPending: false,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case '2FA_PENDING':
      return { ...state, isLoading: false, error: null, is2FAPending: true };
    default:
      return state;
  }
};

// ==================== CONTEXT ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,
    is2FAPending: false,
  });

  // Use a ref to track 2FA pending status to avoid closure issues
  const is2FAPendingRef = React.useRef(false);

  // ==================== SECURE STORAGE ====================

  const storeToken = async (token: string) => {
    try {
      await storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  };

  const getStoredToken = async (): Promise<string | null> => {
    try {
      return await storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const removeStoredToken = async () => {
    try {
      await storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  const storeUserData = async (user: User) => {
    try {
      await storageService.setUserData(STORAGE_KEYS.USER_DATA, user);
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const getStoredUserData = async (): Promise<User | null> => {
    try {
      return await storageService.getUserData(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  };

  const removeStoredUserData = async () => {
    try {
      await storageService.removeUserData(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  };

  // ==================== AUTH METHODS ====================

  const login = async (credentials: UserLogin): Promise<{ success: boolean; user: User; two_factor_required?: boolean }> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Call backend API
      const authResponse = await apiService.login(credentials);
      
      console.log('🔐 AuthContext - authResponse:', authResponse);
      console.log('🔐 AuthContext - token_type:', authResponse.token_type);
      console.log('🔐 AuthContext - two_factor_required:', authResponse.two_factor_required);
      
      // Check if 2FA is required
      if (authResponse.token_type === '2fa_required' || authResponse.two_factor_required) {
        console.log('🔐 AuthContext - 2FA required detected, dispatching 2FA_PENDING');
        is2FAPendingRef.current = true; // Set ref immediately
        
        // Store in AsyncStorage to persist across remounts
        await AsyncStorage.setItem('is2FAPending', 'true');
        console.log('🔐 AuthContext - Stored is2FAPending in AsyncStorage');
        
        dispatch({ type: '2FA_PENDING' });
        console.log('🔐 AuthContext - is2FAPendingRef set to true');
        console.log('🔐 AuthContext - Returning two_factor_required: true');
        return { success: true, user: {} as User, two_factor_required: true };
      }
      
      const user = await apiService.getProfile();
      
      // Store token and user data
      await storeToken(authResponse.access_token);
      await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      // Clear 2FA pending flag (normal login)
      is2FAPendingRef.current = false;
      await AsyncStorage.removeItem('is2FAPending');
      console.log('🔐 Cleared is2FAPending from AsyncStorage');
      
      // Update context
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: authResponse.access_token },
      });
      
      return { success: true, user };
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      // Clear 2FA pending flag on error
      is2FAPendingRef.current = false;
      await AsyncStorage.removeItem('is2FAPending');
      
      // Enhanced error handling
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid credentials format';
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, user: {} as User };
    }
  };

  const register = async (userData: UserRegistration): Promise<{ success: boolean; user: User }> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Call backend API
      const user = await apiService.register(userData);
      
      // For registration, we need to login to get a token
      const loginResponse = await apiService.login({
        email: userData.email,
        password: userData.password,
      });
      
      // Store token and user data
      await storeToken(loginResponse.access_token);
      await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      // Update context
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: loginResponse.access_token },
      });
      
      return { success: true, user };
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      // Enhanced error handling
      if (error.response?.status === 409) {
        errorMessage = 'User already exists with this email';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid registration data';
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.data?.detail) {
        // Handle validation errors
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else {
          errorMessage = 'Validation error occurred';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, user: {} as User };
    }
  };

  const clearAuthData = async (): Promise<void> => {
    try {
      await removeStoredToken();
      await removeStoredUserData();
      console.log('✅ Authentication data cleared');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear stored data
      await clearAuthData();
      
      // Clear 2FA pending flag
      is2FAPendingRef.current = false;
      await AsyncStorage.removeItem('is2FAPending');
      
      // Update context
      dispatch({ type: 'LOGOUT' });
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still update context even if storage clearing fails
      is2FAPendingRef.current = false;
      await AsyncStorage.removeItem('is2FAPending').catch(() => {});
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    // Also update stored user data
    storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  };

  const clear2FAPending = async (): Promise<void> => {
    console.log('🔐 clear2FAPending called - clearing all 2FA flags');
    is2FAPendingRef.current = false;
    await AsyncStorage.removeItem('is2FAPending');
    await AsyncStorage.removeItem('2fa_email');
    console.log('🔐 All 2FA flags cleared');
  };

  const checkAuthStatus = async (): Promise<void> => {
    try {
      console.log('🔍 === Starting checkAuthStatus ===');
      
      // Check AsyncStorage for 2FA pending status
      const is2FAPendingStorage = await AsyncStorage.getItem('is2FAPending');
      console.log('🔍 is2FAPending from storage:', is2FAPendingStorage);
      console.log('🔍 is2FAPendingRef.current:', is2FAPendingRef.current);
      
      // Don't check auth if 2FA is pending (check both ref and storage)
      if (is2FAPendingRef.current || is2FAPendingStorage === 'true') {
        console.log('⏳ 2FA verification pending, skipping auth check');
        is2FAPendingRef.current = true; // Sync ref with storage
        return;
      }
      
      console.log('🔍 Getting stored token...');
      const token = await getStoredToken();
      console.log('🔍 Token retrieved:', token ? `${token.substring(0, 20)}...` : 'null');
      
      if (!token) {
        console.log('🚪 No stored token found, user not authenticated');
        dispatch({ type: 'LOGOUT' });
        return;
      }

      console.log('🔐 Token found, verifying with backend...');
      console.log('🔐 Calling apiService.getProfile()...');

      // Verify token by getting user profile
      const user = await apiService.getProfile();
      console.log('✅ Profile fetched successfully!');
      console.log('✅ User email:', user.email);
      console.log('✅ User data:', JSON.stringify(user, null, 2));

      // Clear 2FA pending flag
      is2FAPendingRef.current = false;
      await AsyncStorage.removeItem('is2FAPending');
      console.log('🔐 Cleared is2FAPending from AsyncStorage (checkAuthStatus)');
      
      console.log('🔐 Dispatching AUTH_SUCCESS...');
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      console.log('✅ === checkAuthStatus completed successfully ===');
    } catch (error: any) {
      console.error('❌ === Auth check failed ===');
      console.error('❌ Error details:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response?.data);

      // Don't logout if 2FA is pending (use ref for immediate value)
      if (is2FAPendingRef.current) {
        console.log('⏳ 2FA verification pending (ref check), not logging out');
        return;
      }

      // Clear all stored authentication data immediately
      console.log('🗑️ Clearing auth data...');
      await clearAuthData();

      // Enhanced error handling - always logout on any error during auth check
      console.log('🔑 Authentication failed, logging out user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    console.log('🔄 AuthProvider mounted, checking authentication...');
    console.log('🔄 is2FAPendingRef.current:', is2FAPendingRef.current);
    
    // Delay auth check slightly to allow other initialization to complete
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms
      console.log('🔍 Running auth check');
      checkAuthStatus(); // checkAuthStatus will check the ref internally
    };
    
    checkAuth();
  }, []); // Only run on mount

  // ==================== CONTEXT VALUE ====================

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
    clearAuthData,
    checkAuthStatus,
    clear2FAPending,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// ==================== HOOK ====================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
