/**
 * Sign Up Screen with UVA branding
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

export default function SignUpScreen({ onBackPress }: {
  onBackPress?: () => void;
}) {
  const { signUp, loading } = useAuth();
  const { colors } = useTheme();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
    username?: string;
  }>({});

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    const { error } = await signUp(
      formData.email.toLowerCase().trim(),
      formData.password,
      {
        full_name: formData.fullName.trim(),
        username: formData.username.toLowerCase().trim(),
      }
    );
    
    if (error) {
      let errorMessage = 'An error occurred during sign up';
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      Alert.alert('Sign Up Failed', errorMessage);
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
              <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                <ThemedText variant="h2" color="onPrimary" style={styles.logoText}>
                  UVA
                </ThemedText>
              </View>
              
              <ThemedText variant="h2" color="primary" style={styles.title}>
                Join HoosClimbing
              </ThemedText>
              
              <ThemedText variant="body" color="textSecondary" style={styles.subtitle}>
                Connect with the UVA climbing community
              </ThemedText>
            </View>

            {/* Sign Up Form */}
            <Card style={styles.formCard}>
              <View style={styles.form}>
                <TextInputField
                  label="Full Name"
                  value={formData.fullName}
                  onChangeText={(text) => updateFormData('fullName', text)}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  error={formErrors.fullName}
                  leftIcon={
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                />
                
                <TextInputField
                  label="Username"
                  value={formData.username}
                  onChangeText={(text) => updateFormData('username', text.toLowerCase())}
                  placeholder="Choose a username"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={formErrors.username}
                  leftIcon={
                    <Ionicons
                      name="at-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                />
                
                <TextInputField
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
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
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  placeholder="Create a password"
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
                
                <TextInputField
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  error={formErrors.confirmPassword}
                  leftIcon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.passwordToggle}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  }
                />
                
                <Button
                  title="Create Account"
                  onPress={handleSignUp}
                  loading={loading}
                  variant="primary"
                  size="large"
                  fullWidth
                  style={styles.signUpButton}
                />
              </View>
            </Card>

            {/* Sign In Link */}
            <View style={styles.signInSection}>
              <ThemedText variant="body" color="textSecondary">
                Already have an account?{' '}
              </ThemedText>
              <TouchableOpacity onPress={onBackPress}>
                <ThemedText variant="body" color="primary" style={styles.signInLink}>
                  Sign in
                </ThemedText>
              </TouchableOpacity>
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
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    boxShadow: '0px 4px 8px rgba(35, 45, 75, 0.3)',
    elevation: 8,
  },
  logoText: {
    textAlign: 'center',
    fontSize: 18,
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
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  passwordToggle: {
    padding: spacing.sm,
  },
  signUpButton: {
    marginTop: spacing.md,
    boxShadow: '0px 4px 8px rgba(248, 76, 30, 0.3)',
    elevation: 8,
  },
  signInSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  signInLink: {
    fontWeight: '600',
  },
});
