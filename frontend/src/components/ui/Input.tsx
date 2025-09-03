import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, Colors, Spacing, BorderRadius, Elevation } from '../../design';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
  editable?: boolean;
}

const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helperText,
  variant = 'outlined',
  size = 'medium',
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  maxLength,
  editable = true,
}) => {
  const { colors } = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      backgroundColor: variant === 'filled' ? colors.surface : colors.surface,
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderRadius: BorderRadius.md,
      ...(isFocused ? Elevation.level2 : Elevation.level1),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isFocused ? 2 : 1 },
      shadowOpacity: isFocused ? 0.2 : 0.1,
      shadowRadius: isFocused ? 4 : 2,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        minHeight: 56,
      },
    };

    const stateStyles: ViewStyle = {
      borderColor: error
        ? Colors.semantic.error
        : isFocused
        ? colors.primary
        : colors.border,
      backgroundColor: disabled
        ? colors.surface
        : variant === 'filled'
        ? colors.surface
        : colors.surface,
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...stateStyles,
      ...style,
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseInputStyle: TextStyle = {
      flex: 1,
      color: disabled ? colors.text.secondary : colors.text.primary,
    };

    const sizeInputStyles: Record<string, TextStyle> = {
      small: {
        fontSize: 12,
      },
      medium: {
        fontSize: 14,
      },
      large: {
        fontSize: 16,
      },
    };

    const multilineStyle: TextStyle = multiline
      ? {
          textAlignVertical: 'top',
          paddingTop: Spacing.xs,
        }
      : {};

    return {
      ...baseInputStyle,
      ...sizeInputStyles[size],
      ...multilineStyle,
      ...inputStyle,
    };
  };

  const getIconStyle = () => ({
    marginHorizontal: Spacing.xs,
    color: error
      ? Colors.semantic.error
      : isFocused
      ? colors.primary
      : colors.text.secondary,
  });

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity onPress={handlePasswordToggle} style={styles.iconButton}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            style={getIconStyle()}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.iconButton}
          disabled={!onRightIconPress}
        >
          <Ionicons name={rightIcon} size={20} style={getIconStyle()} />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, { color: error ? Colors.semantic.error : colors.text.primary }]}>
          {label}
        </Text>
      )}
      
      <View style={getContainerStyle()}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} style={getIconStyle()} />
        )}
        
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable && !disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {renderRightIcon()}
      </View>
      
              {(error || helperText) && (
                  <Text style={[styles.helperText, { color: error ? Colors.semantic.error : colors.text.secondary }]}>
          {error || helperText}
        </Text>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  helperText: {
    fontSize: 12,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default Input;
