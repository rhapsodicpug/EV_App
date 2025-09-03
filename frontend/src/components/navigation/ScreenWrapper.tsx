/**
 * Screen Wrapper Component
 * Provides consistent layout with dynamic header for all screens
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../design';
import DynamicHeader from './DynamicHeader';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollEnabled?: boolean;
  refreshControl?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  bounces?: boolean;
  overScrollMode?: 'auto' | 'always' | 'never';
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  onScroll?: (event: any) => void;
  scrollEventThrottle?: number;
  // DynamicHeader props
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  showNotification?: boolean;
  showMenu?: boolean;
  showClose?: boolean;
  showMore?: boolean;
  showExpand?: boolean;
  onBack?: () => void;
  onSearch?: () => void;
  onFilter?: () => void;
  onNotification?: () => void;
  onMenu?: () => void;
  onClose?: () => void;
  onMore?: () => void;
  onExpand?: () => void;
  transparent?: boolean;
  variant?: 'default' | 'elevated' | 'transparent' | 'gradient';
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  expanded?: boolean;
  showShadow?: boolean;
  blurEffect?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollEnabled = true,
  refreshControl = false,
  onRefresh,
  refreshing = false,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  bounces = true,
  overScrollMode = 'auto',
  keyboardShouldPersistTaps = 'handled',
  onScroll,
  scrollEventThrottle = 16,
  ...headerProps
}) => {
  const { colors } = useThemeColors();
  const scrollY = new Animated.Value(0);

  const dynamicStyles = {
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    content: {
      paddingTop: 100, // Account for absolute positioned header
      paddingHorizontal: 16,
      ...contentContainerStyle,
    },
    // Gradient fade effect styles
    mainContentArea: {
      /*
        This creates a "fade-to-black" effect at the bottom of the scrollable area,
        right above where the navigation bar sits.
        The padding ensures the content can scroll up high enough to actually fade out
        without being instantly hidden by the nav bar.
      */
      paddingBottom: 120, // Extra padding for fade effect + nav bar height
    },
    gradientFade: {
      /*
        Positioned absolutely at the bottom of the ScrollView
        Creates a gradient fade from transparent to background color
        Equivalent to CSS: -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%)
      */
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 80, // Height of the fade effect
      // The LinearGradient creates the fade from transparent to background color
    },
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: onScroll,
    }
  );

  return (
    <View style={dynamicStyles.container}>
      <DynamicHeader
        {...headerProps}
        scrollY={scrollY}
      />
      
      {scrollEnabled ? (
        <Animated.ScrollView
          style={dynamicStyles.container}
          contentContainerStyle={[dynamicStyles.content, dynamicStyles.mainContentArea]}
          refreshControl={
            refreshControl ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            ) : undefined
          }
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
          bounces={bounces}
          overScrollMode={overScrollMode}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          onScroll={handleScroll}
          scrollEventThrottle={scrollEventThrottle}
        >
          {children}

          {/* Gradient Fade Effect - creates "fade-to-black" at bottom */}
          <LinearGradient
            colors={['transparent', colors.background]}
            style={dynamicStyles.gradientFade}
            pointerEvents="none"
          />
        </Animated.ScrollView>
      ) : (
        <View style={[dynamicStyles.container, dynamicStyles.content]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenWrapper;
