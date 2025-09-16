import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import {
  ArrowLeft,
  Camera,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import CustomModal from '../components/ui/CustomModal';

// Color Palette matching the design
const COLORS = {
  background: '#1A1A1A',
  surface: '#1A1A1A',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#666666',
  },
  border: {
    subtle: '#2A2A2A',
    light: '#404040',
  },
  accent: '#8cd279', // Lime green theme
  inputBackground: '#2A2A2A',
  profileImageBackground: '#FFB366', // Light peach/orange background
};

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  // State for profile image
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // State for modals
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle back gesture
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileImagePress = () => {
    setShowImagePickerModal(true);
  };

  const handleTakePhoto = () => {
    setShowCameraModal(true);
  };

  const handleChooseFromGallery = () => {
    setShowGalleryModal(true);
  };

  const handleSaveChanges = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Please fill in all required fields');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement save profile functionality
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = () => {
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  const getMemberSince = () => {
    // TODO: Get actual member since date from user data
    return '2021';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content with Keyboard Handling */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        {/* Profile Photo Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleProfileImagePress}
            activeOpacity={0.8}
          >
            <View style={styles.profileImageBackground}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Camera size={40} color={COLORS.text.primary} />
                </View>
              )}
            </View>
            <View style={styles.cameraIconContainer}>
              <Camera size={16} color={COLORS.text.primary} />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{getUserName()}</Text>
          <Text style={styles.memberSince}>Member since {getMemberSince()}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.text.tertiary}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>

          {/* Phone Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.text.tertiary}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSaveChanges}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Modals */}
      <CustomModal
        visible={showImagePickerModal}
        title="Change Profile Photo"
        message="Choose an option"
        options={[
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Take Photo',
            onPress: handleTakePhoto,
          },
          {
            text: 'Choose from Gallery',
            onPress: handleChooseFromGallery,
          },
        ]}
        onClose={() => setShowImagePickerModal(false)}
      />

      <CustomModal
        visible={showCameraModal}
        title="Camera"
        message="Camera functionality coming soon!"
        options={[{
          text: 'OK',
          onPress: () => {},
        }]}
        onClose={() => setShowCameraModal(false)}
      />

      <CustomModal
        visible={showGalleryModal}
        title="Gallery"
        message="Gallery picker functionality coming soon!"
        options={[{
          text: 'OK',
          onPress: () => {},
        }]}
        onClose={() => setShowGalleryModal(false)}
      />

      <CustomModal
        visible={showSuccessModal}
        title="Success"
        message="Profile updated successfully!"
        options={[{
          text: 'OK',
          onPress: () => navigation.goBack(),
        }]}
        onClose={() => setShowSuccessModal(false)}
      />

      <CustomModal
        visible={showErrorModal}
        title="Error"
        message={errorMessage}
        options={[{
          text: 'OK',
          onPress: () => {},
        }]}
        onClose={() => setShowErrorModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40, // Extra padding for better keyboard handling
  },
  
  // Profile Section
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImageBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.profileImageBackground,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.profileImageBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  
  // Form Section
  formSection: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  
  // Button Section
  buttonContainer: {
    paddingBottom: 100, // Extra padding to avoid bottom navigation overlap
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
});

export default EditProfileScreen;