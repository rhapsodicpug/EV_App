import { Platform, Share, Alert } from 'react-native';
import { storageService } from './StorageService';

// ==================== TYPES ====================

export interface StationReview {
  id: string;
  stationId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  comment: string;
  photos: string[]; // URLs or base64
  timestamp: Date;
  helpfulCount: number;
  isVerified: boolean;
  tags: string[]; // e.g., ['fast-charging', 'clean', 'convenient']
}

export interface StationRating {
  stationId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  tags: {
    [key: string]: number; // tag name -> count
  };
}

export interface StationPhoto {
  id: string;
  stationId: string;
  userId: string;
  userName: string;
  photoUrl: string;
  caption?: string;
  timestamp: Date;
  likes: number;
  isVerified: boolean;
  category: 'station' | 'amenities' | 'surroundings' | 'charging';
}

export interface FavoriteStation {
  id: string;
  stationId: string;
  userId: string;
  addedAt: Date;
  notes?: string;
  isPinned: boolean;
}

export interface SocialStats {
  totalReviews: number;
  totalPhotos: number;
  totalFavorites: number;
  averageRating: number;
  topTags: string[];
}

// ==================== SOCIAL SERVICE ====================

class SocialService {
  private isWeb = Platform.OS === 'web';

  // ==================== REVIEWS & RATINGS ====================

  async getStationReviews(stationId: string, limit: number = 20, offset: number = 0): Promise<StationReview[]> {
    try {
      const stored = await storageService.getItem(`reviews_${stationId}`);
      if (stored) {
        const reviews: StationReview[] = JSON.parse(stored);
        return reviews
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(offset, offset + limit);
      }

      // Return mock reviews
      const mockReviews: StationReview[] = [
        {
          id: 'review_001',
          stationId,
          userId: 'user_001',
          userName: 'Rahul S.',
          rating: 5,
          comment: 'Excellent charging station! Fast DC charger and clean facilities. Staff is very helpful.',
          photos: [],
          timestamp: new Date('2024-01-15'),
          helpfulCount: 12,
          isVerified: true,
          tags: ['fast-charging', 'clean', 'helpful-staff'],
        },
        {
          id: 'review_002',
          stationId,
          userId: 'user_002',
          userName: 'Priya M.',
          rating: 4,
          comment: 'Good location and reasonable pricing. The station is well-maintained.',
          photos: [],
          timestamp: new Date('2024-01-10'),
          helpfulCount: 8,
          isVerified: true,
          tags: ['good-location', 'well-maintained', 'reasonable-pricing'],
        },
        {
          id: 'review_003',
          stationId,
          userId: 'user_003',
          userName: 'Amit K.',
          rating: 5,
          comment: 'Very convenient location near the highway. Quick charging and good amenities.',
          photos: [],
          timestamp: new Date('2024-01-08'),
          helpfulCount: 15,
          isVerified: true,
          tags: ['convenient-location', 'quick-charging', 'good-amenities'],
        },
      ];

      await storageService.setItem(`reviews_${stationId}`, JSON.stringify(mockReviews));
      return mockReviews.slice(offset, offset + limit);
    } catch (error) {
      console.error('❌ Error getting station reviews:', error);
      return [];
    }
  }

  async addStationReview(review: Omit<StationReview, 'id' | 'timestamp' | 'helpfulCount'>): Promise<StationReview> {
    try {
      const newReview: StationReview = {
        ...review,
        id: `review_${Date.now()}`,
        timestamp: new Date(),
        helpfulCount: 0,
      };

      const existingReviews = await this.getStationReviews(review.stationId, 1000, 0);
      existingReviews.unshift(newReview);
      
      await storageService.setItem(`reviews_${review.stationId}`, JSON.stringify(existingReviews));
      
      // Update station rating
      await this.updateStationRating(review.stationId);
      
      console.log('✅ Station review added:', newReview.id);
      return newReview;
    } catch (error) {
      console.error('❌ Error adding station review:', error);
      throw error;
    }
  }

  async updateStationRating(stationId: string): Promise<StationRating> {
    try {
      const reviews = await this.getStationReviews(stationId, 1000, 0);
      
      if (reviews.length === 0) {
        return {
          stationId,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
          tags: {},
        };
      }

      // Calculate rating distribution
      const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      const totalRating = reviews.reduce((sum, review) => {
        if (review.rating && typeof review.rating === 'number') {
          const ratingKey = review.rating.toString() as keyof typeof distribution;
          distribution[ratingKey]++;
          return sum + review.rating;
        }
        return sum;
      }, 0);

      // Calculate average rating
      const averageRating = totalRating / reviews.length;

      // Collect tags
      const tags: { [key: string]: number } = {};
      reviews.forEach(review => {
        review.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      });

      const rating: StationRating = {
        stationId,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution: distribution,
        tags,
      };

      await storageService.setItem(`rating_${stationId}`, JSON.stringify(rating));
      return rating;
    } catch (error) {
      console.error('❌ Error updating station rating:', error);
      throw error;
    }
  }

  async getStationRating(stationId: string): Promise<StationRating> {
    try {
      const stored = await storageService.getItem(`rating_${stationId}`);
      if (stored) {
        return JSON.parse(stored);
      }

      // Return default rating
      return {
        stationId,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        tags: {},
      };
    } catch (error) {
      console.error('❌ Error getting station rating:', error);
      throw error;
    }
  }

  // ==================== PHOTO UPLOADS ====================

  async uploadStationPhoto(
    stationId: string,
    userId: string,
    userName: string,
    photoUri: string,
    caption?: string,
    category: StationPhoto['category'] = 'station'
  ): Promise<StationPhoto> {
    try {
      // In a real app, upload to cloud storage (AWS S3, Firebase Storage, etc.)
      // For now, we'll store the URI locally
      
      const photo: StationPhoto = {
        id: `photo_${Date.now()}`,
        stationId,
        userId,
        userName,
        photoUrl: photoUri,
        caption,
        timestamp: new Date(),
        likes: 0,
        isVerified: false,
        category,
      };

      // Store photo metadata
      const photos = await this.getStationPhotos(stationId);
      photos.unshift(photo);
      await storageService.setItem(`photos_${stationId}`, JSON.stringify(photos));

      console.log('✅ Station photo uploaded:', photo.id);
      return photo;
    } catch (error) {
      console.error('❌ Error uploading station photo:', error);
      throw error;
    }
  }

  async getStationPhotos(stationId: string, category?: string): Promise<StationPhoto[]> {
    try {
      const stored = await storageService.getItem(`photos_${stationId}`);
      if (stored) {
        const photos: StationPhoto[] = JSON.parse(stored);
        if (category) {
          return photos.filter(photo => photo.category === category);
        }
        return photos;
      }

      return [];
    } catch (error) {
      console.error('❌ Error getting station photos:', error);
      return [];
    }
  }

  async pickImage(): Promise<string | null> {
    try {
      if (this.isWeb) {
        // Web image picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        return new Promise((resolve) => {
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                resolve(reader.result as string);
              };
              reader.readAsDataURL(file);
            } else {
              resolve(null);
            }
          };
          input.click();
        });
      } else {
        // Mobile image picker
        try {
          const ImagePicker = await this.getImagePickerModule();
          if (!ImagePicker) {
            console.log('📱 Image picker not available');
            return null;
          }

          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your photo library');
            return null;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
            return result.assets[0].uri;
          }
        } catch (error) {
          console.log('📱 Image picker failed:', error);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error picking image:', error);
      return null;
    }
  }

  // ==================== FAVORITES ====================

  async getFavoriteStations(userId: string): Promise<FavoriteStation[]> {
    try {
      const stored = await storageService.getItem(`favorites_${userId}`);
      if (stored) {
        const favorites: FavoriteStation[] = JSON.parse(stored);
        return favorites.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        });
      }

      return [];
    } catch (error) {
      console.error('❌ Error getting favorite stations:', error);
      return [];
    }
  }

  async addToFavorites(stationId: string, userId: string, notes?: string): Promise<FavoriteStation> {
    try {
      const favorites = await this.getFavoriteStations(userId);
      
      // Check if already favorited
      const existing = favorites.find(f => f.stationId === stationId);
      if (existing) {
        throw new Error('Station already in favorites');
      }

      const favorite: FavoriteStation = {
        id: `favorite_${Date.now()}`,
        stationId,
        userId,
        addedAt: new Date(),
        notes,
        isPinned: false,
      };

      favorites.push(favorite);
      await storageService.setItem(`favorites_${userId}`, JSON.stringify(favorites));
      
      console.log('✅ Station added to favorites:', stationId);
      return favorite;
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      throw error;
    }
  }

  async removeFromFavorites(stationId: string, userId: string): Promise<void> {
    try {
      const favorites = await this.getFavoriteStations(userId);
      const filtered = favorites.filter(f => f.stationId !== stationId);
      
      await storageService.setItem(`favorites_${userId}`, JSON.stringify(filtered));
      console.log('✅ Station removed from favorites:', stationId);
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      throw error;
    }
  }

  async togglePinFavorite(favoriteId: string, userId: string): Promise<void> {
    try {
      const favorites = await this.getFavoriteStations(userId);
      const updated = favorites.map(f => 
        f.id === favoriteId ? { ...f, isPinned: !f.isPinned } : f
      );
      
      await storageService.setItem(`favorites_${userId}`, JSON.stringify(updated));
      console.log('✅ Favorite pin toggled:', favoriteId);
    } catch (error) {
      console.error('❌ Error toggling favorite pin:', error);
      throw error;
    }
  }

  async updateFavoriteNotes(favoriteId: string, userId: string, notes: string): Promise<void> {
    try {
      const favorites = await this.getFavoriteStations(userId);
      const updated = favorites.map(f => 
        f.id === favoriteId ? { ...f, notes } : f
      );
      
      await storageService.setItem(`favorites_${userId}`, JSON.stringify(updated));
      console.log('✅ Favorite notes updated:', favoriteId);
    } catch (error) {
      console.error('❌ Error updating favorite notes:', error);
      throw error;
    }
  }

  // ==================== SHARING ====================

  async shareStation(stationId: string, stationName: string, stationAddress: string): Promise<void> {
    try {
      const shareMessage = `🔋 Check out this EV charging station!\n\n📍 ${stationName}\n🏠 ${stationAddress}\n\nDownload the EV Charging App to find more stations near you!`;
      
      if (this.isWeb) {
        // Web sharing
        if (navigator.share) {
          await navigator.share({
            title: 'EV Charging Station',
            text: shareMessage,
            url: window.location.href,
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(shareMessage);
          Alert.alert('Copied!', 'Station details copied to clipboard');
        }
      } else {
        // Mobile sharing
        await Share.share({
          message: shareMessage,
          title: 'EV Charging Station',
        });
      }

      console.log('✅ Station shared successfully');
    } catch (error) {
      console.error('❌ Error sharing station:', error);
    }
  }

  async shareReview(review: StationReview): Promise<void> {
    try {
      const shareMessage = `⭐ ${review.rating}/5 stars for this EV charging station!\n\n"${review.comment}"\n\n- ${review.userName}`;
      
      if (this.isWeb) {
        if (navigator.share) {
          await navigator.share({
            title: 'EV Station Review',
            text: shareMessage,
          });
        } else {
          await navigator.clipboard.writeText(shareMessage);
          Alert.alert('Copied!', 'Review copied to clipboard');
        }
      } else {
        await Share.share({
          message: shareMessage,
          title: 'EV Station Review',
        });
      }

      console.log('✅ Review shared successfully');
    } catch (error) {
      console.error('❌ Error sharing review:', error);
    }
  }

  // ==================== SOCIAL STATS ====================

  async getSocialStats(): Promise<SocialStats> {
    try {
      // In a real app, this would aggregate data from multiple sources
      // For now, return mock stats
      return {
        totalReviews: 1250,
        totalPhotos: 890,
        totalFavorites: 2100,
        averageRating: 4.2,
        topTags: ['fast-charging', 'clean', 'convenient-location', 'good-amenities', 'helpful-staff'],
      };
    } catch (error) {
      console.error('❌ Error getting social stats:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  async markReviewHelpful(reviewId: string, stationId: string): Promise<void> {
    try {
      const reviews = await this.getStationReviews(stationId, 1000, 0);
      const updated = reviews.map(r => 
        r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
      );
      
      await storageService.setItem(`reviews_${stationId}`, JSON.stringify(updated));
      console.log('✅ Review marked as helpful:', reviewId);
    } catch (error) {
      console.error('❌ Error marking review helpful:', error);
    }
  }

  async likePhoto(photoId: string, stationId: string): Promise<void> {
    try {
      const photos = await this.getStationPhotos(stationId);
      const updated = photos.map(p => 
        p.id === photoId ? { ...p, likes: p.likes + 1 } : p
      );
      
      await storageService.setItem(`photos_${stationId}`, JSON.stringify(updated));
      console.log('✅ Photo liked:', photoId);
    } catch (error) {
      console.error('❌ Error liking photo:', error);
    }
  }

  // ==================== MODULE HELPERS ====================

  private async getImagePickerModule(): Promise<any | null> {
    if (this.isWeb) return null;
    
    try {
      const module = await import('expo-image-picker');
      return module.default || module;
    } catch (error) {
      console.log('📱 Failed to import expo-image-picker:', error);
      return null;
    }
  }
}

export const socialService = new SocialService();
export default socialService;
