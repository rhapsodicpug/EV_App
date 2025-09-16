/**
 * Premium Welcome Screen
 * First screen users see when opening the app
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleGetStarted = async () => {
    try {
      // Mark welcome as seen
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      
      // Navigate to Auth flow (Login screen)
      navigation.navigate('Auth' as never);
    } catch (error) {
      console.error('Error marking welcome as seen:', error);
      // Still navigate even if storage fails
      navigation.navigate('Auth' as never);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Full-screen background image */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient overlay for better text readability */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        />
        
        {/* Content overlay card */}
        <View style={styles.overlayCard}>
          <SafeAreaView style={styles.cardContent}>
            {/* Text content */}
            <View style={styles.textContainer}>
              <Text style={styles.headline}>
                Charge Smarter, Drive Greener
              </Text>
              
              <Text style={styles.subheading}>
                Find, reserve, and pay for EV charging effortlessly. Join the electric revolution today.
              </Text>
            </View>
            
            {/* Call-to-action button */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>
                Get Started
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5, // Cover lower half of screen
    backgroundColor: '#1a1a1a', // Very dark gray (near-black)
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
    fontFamily: 'System', // Modern sans-serif
  },
  subheading: {
    fontSize: 16,
    fontWeight: '400',
    color: '#a0a0a0', // Muted gray
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  ctaButton: {
    backgroundColor: '#32d74b', // Bright lime green
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#32d74b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000', // Bold dark font
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;
