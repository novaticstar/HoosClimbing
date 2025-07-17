/**
 * Forgot Password Screen
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { uvaColors } from '../../theme/colors';
import { Button, Card, Container, spacing, TextInputField, ThemedText, useTheme } from '../../theme/ui';

export default function ForgotPasswordScreen({ onBackPress }: {
  onBackPress?: () => void;
}) {
  const { resetPassword } = useAuth();
  const { colors } = useTheme();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string>();

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    
    const { error } = await resetPassword(email.toLowerCase().trim());
    
    if (error) {
      let errorMessage = 'An error occurred while sending the reset email';
      
      if (error.message.includes('User not found')) {
        errorMessage = 'No account found with this email address.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      Alert.alert('Reset Failed', errorMessage);
    }
    
    setLoading(false);
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
              <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={32}
                  color={colors.primary}
                />
              </View>
              
              <ThemedText variant="h2" color="primary" style={styles.title}>
                Reset Password
              </ThemedText>
              
              <ThemedText variant="body" color="textSecondary" style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password
              </ThemedText>
            </View>

            {/* Reset Form */}
            <Card style={styles.formCard}>
              <View style={styles.form}>
                <TextInputField
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) {
                      setEmailError(undefined);
                    }
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={emailError}
                  leftIcon={
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                />
                
                <Button
                  title="Send Reset Link"
                  onPress={handleResetPassword}
                  loading={loading}
                  variant="primary"
                  size="large"
                  fullWidth
                  style={styles.resetButton}
                />
              </View>
            </Card>

            {/* Instructions */}
            <Card style={styles.instructionsCard}>
              <ThemedText variant="h6" color="text" style={styles.instructionsTitle}>
                What happens next?
              </ThemedText>
              
              <View style={styles.instructionsList}>
                <View style={styles.instructionItem}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <ThemedText variant="caption" color="onPrimary" style={styles.stepText}>
                      1
                    </ThemedText>
                  </View>
                  <ThemedText variant="bodySmall" color="textSecondary" style={styles.instructionText}>
                    Check your email for a password reset link
                  </ThemedText>
                </View>
                
                <View style={styles.instructionItem}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <ThemedText variant="caption" color="onPrimary" style={styles.stepText}>
                      2
                    </ThemedText>
                  </View>
                  <ThemedText variant="bodySmall" color="textSecondary" style={styles.instructionText}>
                    Click the link to open the password reset page
                  </ThemedText>
                </View>
                
                <View style={styles.instructionItem}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <ThemedText variant="caption" color="onPrimary" style={styles.stepText}>
                      3
                    </ThemedText>
                  </View>
                  <ThemedText variant="bodySmall" color="textSecondary" style={styles.instructionText}>
                    Enter your new password and sign in
                  </ThemedText>
                </View>
              </View>
            </Card>

            <View style={styles.footer}>
              <ThemedText variant="caption" color="textSecondary" style={styles.footerText}>
                Remember your password? Go back to sign in
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
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  form: {
    gap: spacing.lg,
  },
  resetButton: {
    boxShadow: '0px 4px 8px rgba(248, 76, 30, 0.3)',
    elevation: 8,
  },
  instructionsCard: {
    marginBottom: spacing.xl,
  },
  instructionsTitle: {
    marginBottom: spacing.md,
  },
  instructionsList: {
    gap: spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepText: {
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
});
