/**
 * Enhanced Dynamic Header Component
 * Professional, reusable header with advanced scroll animations and interactions
 * Phase 2: Glass morphism, enhanced animations, and improved UX
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { 
  Search, 
  Filter, 
  Bell, 
  Menu,
  ArrowLeft,
  X,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Zap,
  Battery,
  Navigation,
  Settings
} from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation, Animation } from '../../design';
import { GlassMorphism, Shadows, Responsive, AnimationPresets } from '../../design';

const { width, height } = Dimensions.get('window');

interface DynamicHeaderProps {
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
  scrollY?: Animated.Value;
  transparent?: boolean;
  variant?: 'default' | 'elevated' | 'transparent' | 'gradient' | 'glass';
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  expanded?: boolean;
  showShadow?: boolean;
  blurEffect?: boolean;
  showContext?: boolean; // Weather, location, time
  contextData?: {
    weather?: string;
    location?: string;
    time?: string;
  };
}

const DynamicHeader: React.FC<DynamicHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showSearch = false,
  showFilter = false,
  showNotification = false,
  showMenu = false,
  showClose = false,
  showMore = false,
  showExpand = false,
  onBack,
  onSearch,
  onFilter,
  onNotification,
  onMenu,
  onClose,
  onMore,
  onExpand,
  scrollY,
  transparent = false,
  variant = 'default',
  leftComponent,
  rightComponent,
  expanded = false,
  showShadow = true,
  blurEffect = false,
  showContext = false,
  contextData,
}) => {
  const { colors } = useThemeColors();
  const expandAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const contextAnim = useRef(new Animated.Value(0)).current;

  // Enhanced animated values for header collapse with better interpolation
  const headerHeight = scrollY?.interpolate({
    inputRange: [0, 120],
    outputRange: [140, 80],
    extrapolate: 'clamp',
  }) || new Animated.Value(140);

  const titleOpacity = scrollY?.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  }) || new Animated.Value(1);

  const subtitleOpacity = scrollY?.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  }) || new Animated.Value(1);

  const titleScale = scrollY?.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.85],
    extrapolate: 'clamp',
  }) || new Animated.Value(1);

  const titleTranslateY = scrollY?.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -15],
    extrapolate: 'clamp',
  }) || new Animated.Value(0);

  const backgroundOpacity = scrollY?.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.98],
    extrapolate: 'clamp',
  }) || new Animated.Value(1);

  const shadowOpacity = scrollY?.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 0.4],
    extrapolate: 'clamp',
  }) || new Animated.Value(0);

  const contextOpacity = scrollY?.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  }) || new Animated.Value(1);

  // Enhanced expand animation with spring physics
  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: false,
      tension: 120,
      friction: 10,
    }).start();
  }, [expanded]);

  // Enhanced pulse animation for notifications
  useEffect(() => {
    if (showNotification) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showNotification]);

  // Context animation
  useEffect(() => {
    if (showContext) {
      Animated.timing(contextAnim, {
        toValue: 1,
        duration: Animation.duration.normal,
        useNativeDriver: true,
      }).start();
    }
  }, [showContext]);

  const getHeaderStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        };
      case 'transparent':
        return {
          backgroundColor: 'transparent',
          borderBottomWidth: 0,
        };
      case 'gradient':
        return {
          backgroundColor: colors.primary,
          borderBottomWidth: 0,
        };
      case 'glass':
        return {
          backgroundColor: GlassMorphism.background.light.backgroundColor,
          backdropFilter: GlassMorphism.background.light.backdropFilter,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderBottomWidth: 0,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'elevated':
      case 'transparent':
      case 'glass':
        return colors.text.primary;
      case 'gradient':
      default:
        return Colors.neutral.white;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'elevated':
      case 'transparent':
      case 'glass':
        return colors.text.secondary;
      case 'gradient':
      default:
        return Colors.neutral.white;
    }
  };

  const getButtonStyle = (): any => {
    const baseStyle = {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.full,
      alignItems: 'center' as any,
      justifyContent: 'center' as any,
      marginHorizontal: 4,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        };
      case 'gradient':
      default:
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        };
    }
  };

  const dynamicStyles = {
    header: {
      ...getHeaderStyle(),
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    headerContent: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: Responsive.padding.horizontal,
      paddingBottom: Spacing.md,
      minHeight: 80,
    },
    leftSection: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      flex: 1,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.full,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginRight: Spacing.sm,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: Responsive.fontSize.headline,
      fontWeight: '700' as const,
      color: getTextColor(),
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 12,
      color: getTextColor() + '80',
      fontWeight: '500' as const,
    },
    contextContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginTop: 4,
      gap: Spacing.sm,
    },
    contextItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: BorderRadius.sm,
      backgroundColor: getTextColor() + '10',
    },
    contextText: {
      fontSize: 11,
      color: getTextColor() + '90',
      marginLeft: 4,
      fontWeight: '500' as const,
    },
    rightSection: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: Spacing.sm,
    },
    actionButton: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.full,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...getButtonStyle(),
    },
    expandButton: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.full,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: getTextColor() + '15',
      borderWidth: 1,
      borderColor: getTextColor() + '20',
    },
    shadow: {
      ...Shadows.medium,
    },
  };

  return (
    <Animated.View 
      style={[
        dynamicStyles.header, 
        { 
          height: headerHeight,
          opacity: backgroundOpacity,
          ...(showShadow && { ...dynamicStyles.shadow, shadowOpacity })
        }
      ]}
    >
      <StatusBar 
        barStyle={variant === 'default' || variant === 'gradient' ? "light-content" : "dark-content"}
        backgroundColor={transparent ? 'transparent' : getHeaderStyle().backgroundColor}
        translucent
      />
      
      <View style={dynamicStyles.headerContent}>
        {/* Left Section */}
        <View style={dynamicStyles.leftSection}>
          {leftComponent || (
            <>
              {showBack && (
                <TouchableOpacity 
                  style={dynamicStyles.backButton}
                  onPress={onBack}
                  activeOpacity={0.7}
                >
                  <ArrowLeft size={20} color={getIconColor()} strokeWidth={2} />
                </TouchableOpacity>
              )}
              
              <View style={dynamicStyles.titleContainer}>
                <Animated.Text 
                  style={[
                    dynamicStyles.title,
                    { 
                      opacity: titleOpacity,
                      transform: [
                        { scale: titleScale },
                        { translateY: titleTranslateY }
                      ]
                    }
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Animated.Text>
                {subtitle && (
                  <Animated.Text 
                    style={[
                      dynamicStyles.subtitle,
                      { opacity: subtitleOpacity }
                    ]}
                    numberOfLines={1}
                  >
                    {subtitle}
                  </Animated.Text>
                )}
                
                {/* Context Information */}
                {showContext && contextData && (
                  <Animated.View 
                    style={[
                      dynamicStyles.contextContainer,
                      { opacity: contextOpacity }
                    ]}
                  >
                    {contextData.weather && (
                      <View style={dynamicStyles.contextItem}>
                        <Zap size={12} color={getIconColor()} />
                        <Text style={dynamicStyles.contextText}>{contextData.weather}</Text>
                      </View>
                    )}
                    {contextData.location && (
                      <View style={dynamicStyles.contextItem}>
                        <Navigation size={12} color={getIconColor()} />
                        <Text style={dynamicStyles.contextText}>{contextData.location}</Text>
                      </View>
                    )}
                    {contextData.time && (
                      <View style={dynamicStyles.contextItem}>
                        <Battery size={12} color={getIconColor()} />
                        <Text style={dynamicStyles.contextText}>{contextData.time}</Text>
                      </View>
                    )}
                  </Animated.View>
                )}
              </View>
            </>
          )}
        </View>

        {/* Right Section */}
        <View style={dynamicStyles.rightSection}>
          {rightComponent || (
            <>
              {showSearch && (
                <TouchableOpacity 
                  style={dynamicStyles.actionButton}
                  onPress={onSearch}
                  activeOpacity={0.7}
                >
                  <Search size={20} color={getIconColor()} strokeWidth={2} />
                </TouchableOpacity>
              )}
              
              {showFilter && (
                <TouchableOpacity 
                  style={dynamicStyles.actionButton}
                  onPress={onFilter}
                  activeOpacity={0.7}
                >
                  <Filter size={20} color={getIconColor()} strokeWidth={2} />
                </TouchableOpacity>
              )}
              
              {showNotification && (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity 
                    style={dynamicStyles.actionButton}
                    onPress={onNotification}
                    activeOpacity={0.7}
                  >
                    <Bell size={20} color={getIconColor()} strokeWidth={2} />
                  </TouchableOpacity>
                </Animated.View>
              )}
              
              {showMenu && (
                <TouchableOpacity 
                  style={dynamicStyles.actionButton}
                  onPress={onMenu}
                  activeOpacity={0.7}
                >
                  <Menu size={20} color={getIconColor()} strokeWidth={2} />
                </TouchableOpacity>
              )}

              {showClose && (
                <TouchableOpacity 
                  style={dynamicStyles.actionButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <X size={20} color={getIconColor()} strokeWidth={2} />
                </TouchableOpacity>
              )}

              {showMore && (
                <TouchableOpacity 
                  style={dynamicStyles.actionButton}
                  onPress={onMore}
                  activeOpacity={0.7}
                >
                  <MoreVertical size={20} color={getIconColor()} strokeWidth={2} />
                </TouchableOpacity>
              )}

              {showExpand && (
                <Animated.View style={{ transform: [{ rotate: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg']
                })}] }}>
                  <TouchableOpacity 
                    style={dynamicStyles.expandButton}
                    onPress={onExpand}
                    activeOpacity={0.7}
                  >
                    {expanded ? (
                      <ChevronUp size={20} color={getIconColor()} strokeWidth={2} />
                    ) : (
                      <ChevronDown size={20} color={getIconColor()} strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              )}
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default DynamicHeader;
