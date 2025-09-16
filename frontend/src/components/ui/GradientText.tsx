/**
 * Enhanced Gradient Text Component
 * Text with gradient color effects
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaskedView } from '@react-native-masked-view/masked-view';

import { Gradients, Typography } from '../../design/EnhancedDesignSystem';

interface GradientTextProps {
  children: React.ReactNode;
  gradient?: string[];
  style?: TextStyle;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  gradient = Gradients.primary,
  style,
  fontSize = Typography.fontSize.h1,
  fontWeight = Typography.fontWeight.bold,
  fontFamily = Typography.fontFamily.primary,
}) => {
  return (
    <MaskedView
      style={styles.maskedView}
      maskElement={
        <Text
          style={[
            styles.text,
            {
              fontSize,
              fontWeight,
              fontFamily,
            },
            style,
          ]}
        >
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  maskedView: {
    flex: 1,
  },
  text: {
    backgroundColor: 'transparent',
    textAlign: 'left',
  },
  gradient: {
    flex: 1,
  },
});

export default GradientText;
