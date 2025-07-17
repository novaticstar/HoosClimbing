/**
 * Profile Screen
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText variant="h2" color="primary" style={styles.title}>
              Profile
            </ThemedText>
          </View>

          {/* Profile Card */}
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={32} color={colors.onPrimary} />
              </View>
              <View style={styles.profileInfo}>
                <ThemedText variant="h4" color="text">
                  {user?.user_metadata?.full_name || 'Climber'}
                </ThemedText>
                <ThemedText variant="body" color="textSecondary">
                  @{user?.user_metadata?.username || 'username'}
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary">
                  {user?.email}
                </ThemedText>
              </View>
            </View>
            
            <TouchableOpacity style={styles.editButton}>
              <ThemedText variant="button" color="primary">
                Edit Profile
              </ThemedText>
            </TouchableOpacity>
          </Card>

          {/* Stats Card */}
          <Card style={styles.statsCard}>
            <ThemedText variant="h5" color="text" style={styles.statsTitle}>
              Climbing Stats
            </ThemedText>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText variant="h4" color="accent">
                  12
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary">
                  Routes Completed
                </ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <ThemedText variant="h4" color="primary">
                  5.8
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary">
                  Highest Grade
                </ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <ThemedText variant="h4" color="info">
                  8
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary">
                  Sessions This Month
                </ThemedText>
              </View>
            </View>
          </Card>

          {/* Menu Items */}
          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
              <ThemedText variant="body" color="text" style={styles.menuText}>
                Settings
              </ThemedText>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.menuSeparator, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
              <ThemedText variant="body" color="text" style={styles.menuText}>
                Help & Support
              </ThemedText>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.menuSeparator, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
              <ThemedText variant="body" color="text" style={styles.menuText}>
                About
              </ThemedText>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>

          {/* Sign Out Button */}
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            size="large"
            fullWidth
            style={styles.signOutButton}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText variant="caption" color="textSecondary" style={styles.footerText}>
              HoosClimbing v1.0.0
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary" style={styles.footerText}>
              University of Virginia
            </ThemedText>
          </View>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
  },
  profileCard: {
    marginBottom: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  editButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  statsCard: {
    marginBottom: spacing.xl,
  },
  statsTitle: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuCard: {
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  menuText: {
    flex: 1,
  },
  menuSeparator: {
    height: 1,
    marginHorizontal: -spacing.md,
  },
  signOutButton: {
    marginBottom: spacing.xl,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    textAlign: 'center',
  },
});
