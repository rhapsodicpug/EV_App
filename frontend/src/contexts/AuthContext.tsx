import React, { createContext, useContext, useReducer, useEffect } from 'react';
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
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

interface AuthContextType extends AuthState {
  login: (credentials: UserLogin) => Promise<{ success: boolean; user: User }>;
  register: (userData: UserRegistration) => Promise<{ success: boolean; user: User }>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
  checkAuthStatus: () => Promise<void>;
}

// ==================== REDUCER ====================

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
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
  });

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

  const login = async (credentials: UserLogin): Promise<{ success: boolean; user: User }> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Call backend API
      const authResponse = await apiService.login(credentials);
      const user = await apiService.getProfile();
      
      // Store token and user data
      await storeToken(authResponse.access_token);
      await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      // Update context
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: authResponse.access_token },
      });
      
      return { success: true, user };
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      // Enhanced error handling
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid credentials format';
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Server timeout. Please check if the backend server is running.';
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
        errorMessage = 'Cannot connect to server. Please check if the backend server is running.';
      } else if (error.message?.includes('ECONNREFUSED')) {
        errorMessage = 'Backend server is not running. Please start the server.';
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

  const logout = async (): Promise<void> => {
    try {
      // Clear stored data
      await storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await storageService.removeItem(STORAGE_KEYS.USER_DATA);
      
      // Update context
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still update context even if storage clearing fails
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

  const checkAuthStatus = async (): Promise<void> => {
    try {
      console.log('🔍 Checking authentication status...');
      const token = await getStoredToken();

      if (!token) {
        console.log('🚪 No stored token found, user not authenticated');
        dispatch({ type: 'LOGOUT' });
        return;
      }

      console.log('🔐 Token found, verifying with backend...');

      // Verify token by getting user profile
      const user = await apiService.getProfile();
      console.log('✅ Token valid, user authenticated:', user.email);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
    } catch (error: any) {
      console.error('❌ Auth check failed:', error);

      // Enhanced error handling
      if (error.name === 'AuthenticationError' && error.expired) {
        console.log('🔑 Token expired - user needs to log in again');
        // Set a user-friendly error message
        dispatch({
          type: 'AUTH_FAILURE',
          payload: 'Your session has expired. Please log in again.'
        });
      } else if (error.response?.status === 401) {
        console.log('🔑 Token invalid, logging out');
        dispatch({
          type: 'AUTH_FAILURE',
          payload: 'Session expired. Please log in again.'
        });
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network') || error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
        console.log('🌐 Network/server error during auth check, showing login screen');
        // Show login screen when backend is not available
        dispatch({ type: 'LOGOUT' });
        return;
      } else {
        console.log('⚠️ Other error during auth check');
        dispatch({
          type: 'AUTH_FAILURE',
          payload: 'Unable to verify session. Please try logging in again.'
        });
      }

      // Clear invalid data for auth errors
      if (error.name === 'AuthenticationError' || error.response?.status === 401) {
        await storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        await storageService.removeItem(STORAGE_KEYS.USER_DATA);
        dispatch({ type: 'LOGOUT' });
      }
    }
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.log('⏰ Auth check timeout, forcing logout');
      dispatch({ type: 'LOGOUT' });
    }, 2000); // 2 second timeout

    checkAuthStatus().finally(() => {
      clearTimeout(timeoutId);
    });
  }, []);

  // ==================== CONTEXT VALUE ====================

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
    checkAuthStatus,
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
