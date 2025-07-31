/**
 * Upload Screen
 * Stub implementation for post upload functionality
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uvaColors } from '../theme/colors';
import { spacing, ThemedText, useTheme } from '../theme/ui';

export default function UploadScreen() {
  const { colors } = useTheme();

  // Get screen dimensions for responsive design
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 375; // iPhone SE and smaller
  const isShortScreen = screenHeight < 667; // iPhone SE height and smaller

  const handleCreatePost = () => {
    Alert.alert(
      'Coming Soon!',
      'Post creation feature is currently under development. Stay tuned!'
    );
  };

  const handleCreateStory = () => {
    Alert.alert(
      'Coming Soon!',
      'Story creation feature is currently under development. Stay tuned!'
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: isShortScreen ? spacing.lg : spacing.xxl,
            paddingHorizontal: isSmallScreen ? spacing.md : spacing.lg,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.header,
          { 
            marginBottom: isShortScreen ? spacing.lg : spacing.xxl,
            paddingHorizontal: isSmallScreen ? spacing.md : 0,
          }
        ]}>
          <ThemedText style={[
            styles.title,
            { 
              fontSize: isSmallScreen ? 24 : isShortScreen ? 26 : 28,
              lineHeight: isSmallScreen ? 28 : isShortScreen ? 30 : 32,
            }
          ]}>
            Create Content
          </ThemedText>
          <ThemedText style={[
            styles.subtitle, 
            { 
              color: colors.textSecondary,
              fontSize: isSmallScreen ? 14 : 16,
              lineHeight: isSmallScreen ? 18 : 20,
            }
          ]}>
            Share your climbing adventures with the community
          </ThemedText>
        </View>

        <View style={[
          styles.optionsContainer,
          { marginBottom: isShortScreen ? spacing.lg : spacing.xxl }
        ]}>
          <TouchableOpacity
            style={[
              styles.option, 
              { 
                backgroundColor: colors.surface,
                padding: isSmallScreen ? spacing.md : spacing.lg,
              }
            ]}
            onPress={handleCreatePost}
          >
            <View style={[
              styles.iconContainer, 
              { 
                backgroundColor: uvaColors.cavalierOrange,
                width: isSmallScreen ? 48 : 56,
                height: isSmallScreen ? 48 : 56,
                borderRadius: isSmallScreen ? 24 : 28,
              }
            ]}>
              <Ionicons name="image" size={isSmallScreen ? 28 : 32} color="white" />
            </View>
            <View style={styles.optionContent}>
              <ThemedText style={[
                styles.optionTitle,
                { fontSize: isSmallScreen ? 16 : 18 }
              ]}>
                Create Post
              </ThemedText>
              <ThemedText style={[
                styles.optionDescription, 
                { 
                  color: colors.textSecondary,
                  fontSize: isSmallScreen ? 13 : 14,
                }
              ]}>
                Share photos and videos of your climbs
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option, 
              { 
                backgroundColor: colors.surface,
                padding: isSmallScreen ? spacing.md : spacing.lg,
              }
            ]}
            onPress={handleCreateStory}
          >
            <View style={[
              styles.iconContainer, 
              { 
                backgroundColor: uvaColors.jeffersonBlue,
                width: isSmallScreen ? 48 : 56,
                height: isSmallScreen ? 48 : 56,
                borderRadius: isSmallScreen ? 24 : 28,
              }
            ]}>
              <Ionicons name="play-circle" size={isSmallScreen ? 28 : 32} color="white" />
            </View>
            <View style={styles.optionContent}>
              <ThemedText style={[
                styles.optionTitle,
                { fontSize: isSmallScreen ? 16 : 18 }
              ]}>
                Create Story
              </ThemedText>
              <ThemedText style={[
                styles.optionDescription, 
                { 
                  color: colors.textSecondary,
                  fontSize: isSmallScreen ? 13 : 14,
                }
              ]}>
                Share quick moments that disappear after 24 hours
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[
          styles.tipsContainer,
          { marginTop: isShortScreen ? spacing.md : spacing.lg }
        ]}>
          <ThemedText style={[
            styles.tipsTitle, 
            { 
              color: colors.textSecondary,
              fontSize: isSmallScreen ? 14 : 16,
            }
          ]}>
            Tips for great content:
          </ThemedText>
          <View style={styles.tipsList}>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={isSmallScreen ? 14 : 16} color={uvaColors.cavalierOrange} />
              <ThemedText style={[
                styles.tipText, 
                { 
                  color: colors.textSecondary,
                  fontSize: isSmallScreen ? 13 : 14,
                }
              ]}>
                Share your climbing progress and achievements
              </ThemedText>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={isSmallScreen ? 14 : 16} color={uvaColors.cavalierOrange} />
              <ThemedText style={[
                styles.tipText, 
                { 
                  color: colors.textSecondary,
                  fontSize: isSmallScreen ? 13 : 14,
                }
              ]}>
                Tag your climbing location and routes
              </ThemedText>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={isSmallScreen ? 14 : 16} color={uvaColors.cavalierOrange} />
              <ThemedText style={[
                styles.tipText, 
                { 
                  color: colors.textSecondary,
                  fontSize: isSmallScreen ? 13 : 14,
                }
              ]}>
                Connect with other climbers in the community
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  optionsContainer: {
    // marginBottom removed, will be set dynamically
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionDescription: {
    // fontSize removed, will be set dynamically
  },
  tipsContainer: {
    // marginTop removed, will be set dynamically
  },
  tipsTitle: {
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    // fontSize removed, will be set dynamically
  },
});
