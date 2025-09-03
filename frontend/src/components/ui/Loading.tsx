import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { useThemeColors, Colors, Spacing, BorderRadius } from '../../design';

export interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  style?: ViewStyle;
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'medium',
  text,
  fullScreen = false,
  overlay = false,
  style,
}) => {
  const { colors } = useThemeColors();
  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 40;
      default:
        return 30;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  const renderSpinner = () => (
    <ActivityIndicator
      size={getSpinnerSize()}
      color={colors.primary}
    />
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: size === 'small' ? 6 : size === 'large' ? 10 : 8,
              height: size === 'small' ? 6 : size === 'large' ? 10 : 8,
              backgroundColor: colors.primary,
            },
          ]}
        />
      ))}
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View
        style={[
          styles.skeletonLine,
          {
            height: size === 'small' ? 12 : size === 'large' ? 20 : 16,
            marginBottom: size === 'small' ? 8 : size === 'large' ? 12 : 10,
            backgroundColor: colors.border,
          },
        ]}
      />
      <View
        style={[
          styles.skeletonLine,
          {
            height: size === 'small' ? 10 : size === 'large' ? 16 : 14,
            width: '70%',
            backgroundColor: colors.border,
          },
        ]}
      />
    </View>
  );

  const renderContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const containerStyle: ViewStyle = {
    ...styles.container,
    backgroundColor: colors.background,
    ...(fullScreen && styles.fullScreen),
    ...(overlay && { backgroundColor: colors.surface }),
    ...style,
  };

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        {renderContent()}
        {text && (
                  <Text
          style={[
            styles.text,
            {
              fontSize: getTextSize(),
              marginTop: size === 'small' ? Spacing.sm : Spacing.md,
              color: colors.text.secondary,
            },
          ]}
        >
          {text}
        </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    // backgroundColor will be set dynamically
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: BorderRadius.full,
    marginHorizontal: Spacing.xs,
    opacity: 0.6,
  },
  skeletonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  skeletonLine: {
    borderRadius: BorderRadius.sm,
    width: '100%',
  },
});

export default Loading;
