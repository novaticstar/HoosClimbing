/**
 * Home Screen
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uvaColors } from '../theme/colors';
import { Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
              <ThemedText variant="h2" color="onPrimary" style={styles.logoText}>
                UVA
              </ThemedText>
            </View>
            <ThemedText variant="h1" color="primary" style={styles.title}>
              HoosClimbing
            </ThemedText>
            <ThemedText variant="body" color="textSecondary" style={styles.subtitle}>
              University of Virginia Climbing Community
            </ThemedText>
          </View>

          {/* Welcome Card */}
          <Card style={styles.welcomeCard}>
            <ThemedText variant="h3" color="text" style={styles.welcomeTitle}>
              Welcome to the Community! 🏔️
            </ThemedText>
            <ThemedText variant="body" color="textSecondary" style={styles.welcomeText}>
              Connect with fellow climbers at UVA, discover new routes, and join climbing sessions around Charlottesville.
            </ThemedText>
          </Card>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <ThemedText variant="h2" color="primary" style={styles.statNumber}>
                156
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary" style={styles.statLabel}>
                Active Climbers
              </ThemedText>
            </Card>
            
            <Card style={styles.statCard}>
              <ThemedText variant="h2" color="accent" style={styles.statNumber}>
                42
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary" style={styles.statLabel}>
                Routes Logged
              </ThemedText>
            </Card>
          </View>

          {/* Recent Activity */}
          <Card style={styles.activityCard}>
            <ThemedText variant="h4" color="text" style={styles.sectionTitle}>
              Recent Activity
            </ThemedText>
            
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: colors.accent }]}>
                  <ThemedText variant="caption" color="onAccent" style={styles.activityIconText}>
                    🧗
                  </ThemedText>
                </View>
                <View style={styles.activityContent}>
                  <ThemedText variant="body" color="text">
                    Sarah completed "Crimson Tide" 5.9
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    2 hours ago
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: colors.primary }]}>
                  <ThemedText variant="caption" color="onPrimary" style={styles.activityIconText}>
                    📍
                  </ThemedText>
                </View>
                <View style={styles.activityContent}>
                  <ThemedText variant="body" color="text">
                    New route added at Humpback Rock
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    5 hours ago
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: colors.info }]}>
                  <ThemedText variant="caption" color="onPrimary" style={styles.activityIconText}>
                    👥
                  </ThemedText>
                </View>
                <View style={styles.activityContent}>
                  <ThemedText variant="body" color="text">
                    Climbing session this weekend
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    1 day ago
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>
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
    boxShadow: '0px 2px 4px rgba(35, 45, 75, 0.2)',
    elevation: 4,
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
  },
  welcomeCard: {
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  welcomeText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statNumber: {
    marginBottom: spacing.sm,
  },
  statLabel: {
    textAlign: 'center',
  },
  activityCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  activityList: {
    gap: spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconText: {
    fontSize: 14,
  },
  activityContent: {
    flex: 1,
    gap: spacing.xs,
  },
});
