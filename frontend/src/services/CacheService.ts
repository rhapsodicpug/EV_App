import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, CacheItem<any>>();

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(key, item);
    await AsyncStorage.setItem(key, JSON.stringify(item));
  }

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryItem = this.cache.get(key);
    if (memoryItem && !this.isExpired(memoryItem)) {
      return memoryItem.data;
    }

    // Check persistent storage
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const item: CacheItem<T> = JSON.parse(stored);
        if (!this.isExpired(item)) {
          this.cache.set(key, item);
          return item.data;
        } else {
          await this.remove(key);
        }
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }

    return null;
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key);
    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.clear();
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  // Cache keys for different data types
  static getKeys() {
    return {
      STATIONS: 'cache_stations',
      STATION_DETAIL: (id: string) => `cache_station_${id}`,
      USER_PROFILE: 'cache_user_profile',
      BOOKINGS: 'cache_bookings',
      NEARBY_STATIONS: (lat: number, lng: number) => `cache_nearby_${lat}_${lng}`,
    };
  }
}

export default CacheService;
export const cacheService = CacheService.getInstance();
