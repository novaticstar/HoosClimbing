/**
 * Reusable UI components with UVA theming
 */

import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    useColorScheme,
    View,
    ViewStyle,
} from 'react-native';
import { colors, ThemeColors } from './colors';
import { TextStyleName, textStyles } from './typography';

// Theme hook
export const useTheme = () => {
  const colorScheme = useColorScheme();
  return {
    colors: colors[colorScheme ?? 'light'],
    isDark: colorScheme === 'dark',
  };
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Themed Text Component
interface ThemedTextProps {
  style?: TextStyle | TextStyle[];
  variant?: TextStyleName;
  color?: keyof ThemeColors;
  children: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  variant = 'body',
  color = 'text',
  children,
  ...props
}) => {
  const { colors: themeColors } = useTheme();
  
  return (
    <Text
      style={[
        textStyles[variant],
        { color: themeColors[color] },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

// Button Component
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}) => {
  const { colors: themeColors } = useTheme();
  
  const buttonStyles = StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      borderWidth: 1,
      ...(fullWidth && { width: '100%' }),
    },
    small: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 36,
    },
    medium: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      minHeight: 48,
    },
    large: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      minHeight: 56,
    },
    primary: {
      backgroundColor: themeColors.accent,
      borderColor: themeColors.accent,
    },
    secondary: {
      backgroundColor: themeColors.surface,
      borderColor: themeColors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: themeColors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    disabled: {
      backgroundColor: themeColors.disabled,
      borderColor: themeColors.disabled,
    },
  });
  
  const textColor = (() => {
    if (disabled) return themeColors.onDisabled;
    switch (variant) {
      case 'primary':
        return themeColors.onAccent;
      case 'secondary':
        return themeColors.textOnSurface;
      case 'outline':
        return themeColors.primary;
      case 'ghost':
        return themeColors.primary;
      default:
        return themeColors.onAccent;
    }
  })();
  
  return (
    <TouchableOpacity
      style={[
        buttonStyles.base,
        buttonStyles[size],
        buttonStyles[variant],
        disabled && buttonStyles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {leftIcon}
          <ThemedText
            variant="button"
            style={[
              { color: textColor },
              leftIcon ? { marginLeft: spacing.sm } : {},
              rightIcon ? { marginRight: spacing.sm } : {},
            ]}
          >
            {title}
          </ThemedText>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

// Text Input Component
interface TextInputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}) => {
  const { colors: themeColors } = useTheme();
  
  const inputStyles = StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      marginBottom: spacing.sm,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.surfaceVariant,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: error ? themeColors.error : themeColors.border,
      paddingHorizontal: spacing.md,
      minHeight: 48,
    },
    input: {
      flex: 1,
      fontSize: textStyles.body.fontSize,
      color: themeColors.text,
      paddingVertical: spacing.md,
    },
    icon: {
      marginHorizontal: spacing.sm,
    },
    error: {
      marginTop: spacing.sm,
    },
  });
  
  return (
    <View style={[inputStyles.container, containerStyle]}>
      {label && (
        <ThemedText variant="body" color="text" style={inputStyles.label}>
          {label}
        </ThemedText>
      )}
      <View style={inputStyles.inputContainer}>
        {leftIcon && <View style={inputStyles.icon}>{leftIcon}</View>}
        <TextInput
          style={[inputStyles.input, style]}
          placeholderTextColor={themeColors.textSecondary}
          {...props}
        />
        {rightIcon && <View style={inputStyles.icon}>{rightIcon}</View>}
      </View>
      {error && (
        <ThemedText variant="caption" color="error" style={inputStyles.error}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

// Container Component
interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  safe?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  style,
  padding = 'md',
  safe = false,
}) => {
  const { colors: themeColors } = useTheme();
  
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: themeColors.background,
    ...(padding && { padding: spacing[padding] }),
  };
  
  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
}) => {
  const { colors: themeColors } = useTheme();
  
  const cardStyle: ViewStyle = {
    backgroundColor: themeColors.surface,
    borderRadius: borderRadius.md,
    padding: spacing[padding],
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  };
  
  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};
