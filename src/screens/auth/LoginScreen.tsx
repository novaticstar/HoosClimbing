/**
 * Login Screen with UVA branding and Supabase authentication
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { uvaColors } from '../../theme/colors';
import { Button, Card, Container, spacing, TextInputField, ThemedText, useTheme } from '../../theme/ui';

export default function LoginScreen({ onSignUpPress, onForgotPasswordPress }: {
  onSignUpPress?: () => void;
  onForgotPasswordPress?: () => void;
}) {
  const { signIn, loading } = useAuth();
  const { colors } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    const { error } = await signIn(email.toLowerCase().trim(), password);
    
    if (error) {
      let errorMessage = 'An error occurred during sign in';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      }
      
      Alert.alert('Sign In Failed', errorMessage);
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPasswordPress) {
      onForgotPasswordPress();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Container style={styles.content}>
            {/* Header Section */}
            <View style={styles.header}>
              {/* UVA Logo placeholder - you can add actual logo here */}
              <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                <ThemedText variant="h2" color="onPrimary" style={styles.logoText}>
                  UVA
                </ThemedText>
              </View>
              
              <ThemedText variant="h1" color="primary" style={styles.title}>
                HoosClimbing
              </ThemedText>
              
              <ThemedText variant="body" color="textSecondary" style={styles.subtitle}>
                Welcome back to the University of Virginia climbing community
              </ThemedText>
            </View>

            {/* Login Form */}
            <Card style={styles.formCard}>
              <ThemedText variant="h3" color="text" style={styles.formTitle}>
                Sign In
              </ThemedText>
              
              <View style={styles.form}>
                <TextInputField
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (formErrors.email) {
                      setFormErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={formErrors.email}
                  leftIcon={
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                />
                
                <TextInputField
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (formErrors.password) {
                      setFormErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  error={formErrors.password}
                  leftIcon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  }
                />
                
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.forgotPassword}
                >
                  <ThemedText variant="caption" color="primary">
                    Forgot your password?
                  </ThemedText>
                </TouchableOpacity>
                
                <Button
                  title="Sign In"
                  onPress={handleSignIn}
                  loading={loading}
                  variant="primary"
                  size="large"
                  fullWidth
                  style={styles.signInButton}
                />
              </View>
            </Card>

            {/* Sign Up Link */}
            <View style={styles.signUpSection}>
              <ThemedText variant="body" color="textSecondary">
                New to HoosClimbing?{' '}
              </ThemedText>
              <TouchableOpacity onPress={onSignUpPress}>
                <ThemedText variant="body" color="primary" style={styles.signUpLink}>
                  Create an account
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <ThemedText variant="caption" color="textSecondary" style={styles.footerText}>
                University of Virginia Climbing Community
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary" style={styles.footerText}>
                Wahoowa! 🏔️
              </ThemedText>
            </View>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    boxShadow: '0px 4px 8px rgba(35, 45, 75, 0.3)',
    elevation: 8,
  },
  logoText: {
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  passwordToggle: {
    padding: spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  signInButton: {
    marginTop: spacing.md,
    boxShadow: '0px 4px 8px rgba(248, 76, 30, 0.3)',
    elevation: 8,
  },
  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  signUpLink: {
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    textAlign: 'center',
  },
});
