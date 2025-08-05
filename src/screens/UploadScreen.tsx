/**
 * Upload Screen
 * Gateway for creating posts and events
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { uvaColors } from '../theme/colors';
import { spacing, ThemedText, useTheme } from '../theme/ui';
import CreateEventScreen from './CreateEventScreen';
import CreatePostScreen from './CreatePostScreen';

type UploadScreenNavigationProp = StackNavigationProp<any>;

export default function UploadScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<UploadScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  // Get screen dimensions for responsive design
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 375; // iPhone SE and smaller
  const isShortScreen = screenHeight < 667; // iPhone SE height and smaller

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  const handleCreateEvent = () => {
    setShowCreateEvent(true);
  };

  const handlePostCreated = (postId: string) => {
    setShowCreatePost(false);
    // Navigate to the created post
    navigation.navigate('Feed', {
      screen: 'PostDetail',
      params: { postId }
    });
  };

  const handleEventCreated = () => {
    setShowCreateEvent(false);
    // Optionally navigate to events or refresh
    navigation.navigate('Events');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, spacing.lg),
            paddingBottom: Math.max(insets.bottom, spacing.xl),
            paddingHorizontal: spacing.lg,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.header,
          { 
            marginBottom: spacing.xl,
          }
        ]}>
          <ThemedText style={[
            styles.title,
            { 
              fontSize: isSmallScreen ? 24 : 28,
              lineHeight: isSmallScreen ? 28 : 32,
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
          { marginBottom: spacing.xl }
        ]}>
          <TouchableOpacity
            style={[
              styles.option, 
              { 
                backgroundColor: colors.surface,
                padding: spacing.lg,
              }
            ]}
            onPress={handleCreatePost}
          >
            <View style={[
              styles.iconContainer, 
              { 
                backgroundColor: uvaColors.cavalierOrange,
                width: 56,
                height: 56,
                borderRadius: 28,
              }
            ]}>
              <Ionicons name="image" size={32} color="white" />
            </View>
            <View style={styles.optionContent}>
              <ThemedText style={[
                styles.optionTitle,
                { fontSize: 18 }
              ]}>
                Create Post
              </ThemedText>
              <ThemedText style={[
                styles.optionDescription, 
                { 
                  color: colors.textSecondary,
                  fontSize: 14,
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
            onPress={handleCreateEvent}
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
              <Ionicons name="calendar" size={isSmallScreen ? 28 : 32} color="white" />
            </View>
            <View style={styles.optionContent}>
              <ThemedText style={[
                styles.optionTitle,
                { fontSize: isSmallScreen ? 16 : 18 }
              ]}>
                Create Event
              </ThemedText>
              <ThemedText style={[
                styles.optionDescription, 
                { 
                  color: colors.textSecondary,
                  fontSize: isSmallScreen ? 13 : 14,
                }
              ]}>
                Organize climbing sessions and meetups
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

      {/* Create Post Modal */}
      <Modal
        visible={showCreatePost}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CreatePostScreen
          onPostCreated={handlePostCreated}
          onClose={() => setShowCreatePost(false)}
        />
      </Modal>

      {/* Create Event Modal */}
      <Modal
        visible={showCreateEvent}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CreateEventScreen
          onEventCreated={handleEventCreated}
          onClose={() => setShowCreateEvent(false)}
        />
      </Modal>
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
