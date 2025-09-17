/**
 * Booking Context
 * Manages booking state and operations
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Booking {
  id: string;
  stationId: string;
  stationName: string;
  stationAddress: string;
  date: string;
  time: string;
  duration: number; // in minutes
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

type BookingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; updates: Partial<Booking> } }
  | { type: 'DELETE_BOOKING'; payload: string }
  | { type: 'LOAD_BOOKINGS'; payload: Booking[] }
  | { type: 'MARK_COMPLETED'; payload: string }
  | { type: 'CANCEL_BOOKING'; payload: string };

interface BookingContextType {
  state: BookingState;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  markCompleted: (id: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  getUpcomingBookings: () => Booking[];
  getCompletedBookings: () => Booking[];
  getCancelledBookings: () => Booking[];
  loadBookings: () => Promise<void>;
}

// Storage key
const STORAGE_KEY = '@ev_charging_app:bookings';

// Initial state
const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
};

// Reducer
const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_BOOKING':
      return {
        ...state,
        bookings: [action.payload, ...state.bookings],
        error: null,
      };
    
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.payload.id
            ? { ...booking, ...action.payload.updates }
            : booking
        ),
        error: null,
      };
    
    case 'DELETE_BOOKING':
      const filteredBookings = state.bookings.filter(booking => booking.id !== action.payload);
      console.log('🔄 DELETE_BOOKING reducer - Before:', state.bookings.length, 'After:', filteredBookings.length);
      return {
        ...state,
        bookings: filteredBookings,
        error: null,
      };
    
    case 'LOAD_BOOKINGS':
      return {
        ...state,
        bookings: action.payload,
        loading: false,
        error: null,
      };
    
    case 'MARK_COMPLETED':
      const updatedBookings = state.bookings.map(booking =>
        booking.id === action.payload
          ? { 
              ...booking, 
              status: 'completed' as const,
              completedAt: new Date().toISOString()
            }
          : booking
      );
      console.log('🔄 MARK_COMPLETED reducer - Updated bookings:', updatedBookings.map(b => ({ id: b.id, status: b.status })));
      return {
        ...state,
        bookings: updatedBookings,
        error: null,
      };
    
    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.payload
            ? { 
                ...booking, 
                status: 'cancelled' as const,
                cancelledAt: new Date().toISOString()
              }
            : booking
        ),
        error: null,
      };
    
    default:
      return state;
  }
};

// Context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider
export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Load bookings from storage
  const loadBookings = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const storedBookings = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('📂 Loading bookings from storage:', storedBookings);
      if (storedBookings) {
        const bookings = JSON.parse(storedBookings);
        console.log('📋 Loaded bookings:', bookings.length, 'bookings');
        dispatch({ type: 'LOAD_BOOKINGS', payload: bookings });
      } else {
        console.log('📭 No stored bookings found');
      }
    } catch (error) {
      console.error('❌ Failed to load bookings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load bookings' });
    }
  };

  // Save bookings to storage
  const saveBookings = async (bookings: Booking[]) => {
    try {
      console.log('💾 Saving bookings to storage:', bookings.length, 'bookings');
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
      console.log('💾 Bookings saved successfully');
    } catch (error) {
      console.error('❌ Failed to save bookings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save bookings' });
    }
  };

  // Add new booking
  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    try {
      const newBooking: Booking = {
        ...bookingData,
        id: `BK${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'upcoming',
      };
      
      console.log('📝 Adding new booking:', newBooking);
      dispatch({ type: 'ADD_BOOKING', payload: newBooking });
      await saveBookings([newBooking, ...state.bookings]);
      console.log('✅ Booking added successfully');
    } catch (error) {
      console.error('❌ Failed to add booking:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add booking' });
    }
  };

  // Update booking
  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      dispatch({ type: 'UPDATE_BOOKING', payload: { id, updates } });
      const updatedBookings = state.bookings.map(booking =>
        booking.id === id ? { ...booking, ...updates } : booking
      );
      await saveBookings(updatedBookings);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update booking' });
    }
  };

  // Delete booking
  const deleteBooking = async (id: string) => {
    try {
      console.log('🗑️ Deleting booking:', id);
      console.log('📋 Current bookings before delete:', state.bookings.length);
      
      // Create the updated bookings array
      const updatedBookings = state.bookings.filter(booking => booking.id !== id);
      console.log('📋 Updated bookings after filter:', updatedBookings.length);
      
      // Save to storage first, then update state
      await saveBookings(updatedBookings);
      dispatch({ type: 'DELETE_BOOKING', payload: id });
      console.log('✅ Booking deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete booking:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete booking' });
      throw error; // Re-throw to let the UI handle the error
    }
  };

  // Mark booking as completed
  const markCompleted = async (id: string) => {
    try {
      console.log('✅ Marking booking as completed:', id);
      
      // Create the updated bookings array
      const updatedBookings = state.bookings.map(booking =>
        booking.id === id
          ? { 
              ...booking, 
              status: 'completed' as const,
              completedAt: new Date().toISOString()
            }
          : booking
      );
      
      // Save to storage first, then update state
      await saveBookings(updatedBookings);
      dispatch({ type: 'MARK_COMPLETED', payload: id });
      console.log('✅ Booking marked as completed successfully');
    } catch (error) {
      console.error('❌ Failed to mark booking as completed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark booking as completed' });
    }
  };

  // Cancel booking
  const cancelBooking = async (id: string) => {
    try {
      console.log('❌ Cancelling booking:', id);
      
      // Create the updated bookings array
      const updatedBookings = state.bookings.map(booking =>
        booking.id === id
          ? { 
              ...booking, 
              status: 'cancelled' as const,
              cancelledAt: new Date().toISOString()
            }
          : booking
      );
      
      // Save to storage first, then update state
      await saveBookings(updatedBookings);
      dispatch({ type: 'CANCEL_BOOKING', payload: id });
      console.log('✅ Booking cancelled successfully');
    } catch (error) {
      console.error('❌ Failed to cancel booking:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to cancel booking' });
    }
  };

  // Get upcoming bookings
  const getUpcomingBookings = () => {
    const upcoming = state.bookings
      .filter(booking => booking.status === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    console.log('📅 Upcoming bookings:', upcoming.length, upcoming.map(b => ({ id: b.id, status: b.status })));
    return upcoming;
  };

  // Get completed bookings
  const getCompletedBookings = () => {
    const completed = state.bookings
      .filter(booking => booking.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime());
    console.log('✅ Completed bookings:', completed.length, completed.map(b => ({ id: b.id, status: b.status })));
    return completed;
  };

  // Get cancelled bookings
  const getCancelledBookings = () => {
    const cancelled = state.bookings
      .filter(booking => booking.status === 'cancelled')
      .sort((a, b) => new Date(b.cancelledAt || b.createdAt).getTime() - new Date(a.cancelledAt || a.createdAt).getTime());
    console.log('❌ Cancelled bookings:', cancelled.length, cancelled.map(b => ({ id: b.id, status: b.status })));
    return cancelled;
  };

  // Load bookings on mount
  useEffect(() => {
    loadBookings();
  }, []);

  const value: BookingContextType = {
    state,
    addBooking,
    updateBooking,
    deleteBooking,
    markCompleted,
    cancelBooking,
    getUpcomingBookings,
    getCompletedBookings,
    getCancelledBookings,
    loadBookings,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

// Hook
export const useBookings = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};
