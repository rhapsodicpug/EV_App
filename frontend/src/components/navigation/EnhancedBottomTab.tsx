/**
 * Enhanced Bottom Tab with Advanced Gradient Blur
 * Custom bottom tab component with gradient blur effects
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { 
  Home, 
  Zap,
  Navigation,
  Calendar, 
  User,
} from 'lucide-react-native';
import { useThemeColors, Colors, Spacing, BorderRadius, Animation } from '../../design';
import { Responsive } from '../../design';
import GradientBlurBackground from '../ui/GradientBlurBackground';

interface TabItem {
  key: string;
  title: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}

interface EnhancedBottomTabProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

const EnhancedBottomTab: React.FC<EnhancedBottomTabProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  const { colors } = useThemeColors();

  const renderTabIcon = (tab: TabItem, isActive: boolean) => {
    const IconComponent = tab.icon;
    const iconSize = isActive ? 26 : 22;
    const iconColor = isActive ? Colors.neutral.white : colors.text.secondary;
    const strokeWidth = isActive ? 2.5 : 1.5;

    return (
      <IconComponent 
        size={iconSize} 
        color={iconColor} 
        fill={isActive ? iconColor : 'none'}
        strokeWidth={strokeWidth}
      />
    );
  };

  return (
    <GradientBlurBackground
      variant="primary"
      intensity="strong"
      style={styles.container}
    >
      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                isActive && styles.activeTabItem,
              ]}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.8}
            >
              <Animated.View style={styles.iconContainer}>
                {renderTabIcon(tab, isActive)}
              </Animated.View>
              
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.activeTabLabel,
                ]}
                numberOfLines={1}
              >
                {tab.title}
              </Text>
              
              {isActive && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </GradientBlurBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Responsive.isSmallDevice ? 85 : 95,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    paddingBottom: Responsive.isSmallDevice ? 18 : 22,
    paddingTop: 14,
    flex: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.md,
    marginHorizontal: 2,
    minWidth: 60,
    position: 'relative',
  },
  activeTabItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral.gray[300],
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  activeTabLabel: {
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral.white,
    shadowColor: Colors.neutral.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});

export default EnhancedBottomTab;
