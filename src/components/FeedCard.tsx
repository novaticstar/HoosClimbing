import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { FeedStackParamList } from '../navigation/FeedStack';
import { spacing, ThemedText, useTheme } from '../theme/ui';
import { CommentSection } from './CommentSection';

type FeedCardNavigationProp = StackNavigationProp<FeedStackParamList>;

type FeedCardProps = {
  post: any;
  onLike: (postId: string, hasLiked: boolean) => void;
};

const screenWidth = Dimensions.get('window').width;

export const FeedCard = ({ post, onLike }: FeedCardProps) => {
  const { colors } = useTheme();
  const navigation = useNavigation<FeedCardNavigationProp>();
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Animation refs
  const translateY = useRef(new Animated.Value(screenWidth)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const panStartValue = useRef(0);
  
  const openModal = () => {
    setShowCommentsModal(true);
    
    // Animate background fade in
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Animate modal slide up with spring
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };
  
  const closeModal = () => {
    // Animate modal slide down smoothly with spring
    Animated.spring(translateY, {
      toValue: screenWidth,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
    
    // Animate background fade out
    Animated.timing(backgroundOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowCommentsModal(false);
      setIsFullScreen(false); // Reset full screen state
    });
  };
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical movements and ignore small movements
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        // Store the starting value
        panStartValue.current = 0;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Follow user's finger smoothly with some resistance
        const { dy } = gestureState;
        
        if (dy > 0) {
          // Moving down - allow for closing with some resistance
          const resistedValue = dy * 0.7; // Add resistance
          translateY.setValue(Math.max(0, resistedValue));
        } else if (dy < 0 && !isFullScreen) {
          // Moving up - allow for expanding to full screen with resistance
          const resistedValue = dy * 0.5; // More resistance for upward movement
          translateY.setValue(Math.max(-80, resistedValue));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dy, vy } = gestureState;
        
        // More sensitive thresholds for better UX
        if (dy > 120 || vy > 0.6) {
          // Close the modal - swipe down far enough or fast enough
          closeModal();
        } else if (dy < -80 || vy < -0.6) {
          // Expand to full screen - swipe up far enough or fast enough
          if (!isFullScreen) {
            setIsFullScreen(true);
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }).start();
          }
        } else {
          // Snap back to original position with spring animation
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Stub images for demo purposes
  const stubImages = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ];

  const imageUrl = post.image_url || stubImages[Math.floor(Math.random() * stubImages.length)];

  return (
    <View style={[styles.postCard, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.avatarRow}
          onPress={() => {
            navigation.navigate('UserProfile', {
              userId: post.user_id,
              username: post.profiles?.username
            });
          }}
        >
          {post.profiles?.avatar_url ? (
            <Image
              source={{ uri: post.profiles.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.surfaceVariant }]}>
              <ThemedText variant="caption" color="textSecondary">
                {post.profiles?.username?.charAt(0).toUpperCase() ?? '?'}
              </ThemedText>
            </View>
          )}

          <View style={styles.userInfo}>
            <ThemedText variant="body" color="text" style={styles.username}>
              {post.profiles?.username || 'Anonymous'}
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              {new Date(post.created_at).toLocaleDateString()}
            </ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.postImage}
        resizeMode="cover"
      />

      {/* Actions Bar */}
      <View style={styles.actionsBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            onPress={() => onLike(post.id, post.hasLiked)}
            style={styles.actionButton}
          >
            <Ionicons
              name={post.hasLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={post.hasLiked ? '#FF3040' : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={openModal}
          >
            <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Likes Count */}
      <View style={styles.likesSection}>
        <ThemedText variant="body" color="text" style={styles.likesText}>
          {post.likes} {post.likes === 1 ? 'like' : 'likes'}
        </ThemedText>
      </View>

      {/* Content */}
      {post.description && (
        <View style={styles.contentSection}>
          <ThemedText variant="body" color="text">
            <ThemedText style={styles.username}>{post.profiles?.username || 'Anonymous'}</ThemedText>
            {' ' + post.description}
          </ThemedText>
        </View>
      )}

      {/* Comments Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={showCommentsModal}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <Animated.View 
            style={[
              styles.modalOverlay, 
              { 
                backgroundColor: backgroundOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']
                })
              }
            ]}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View 
                style={[
                  styles.modalContainer, 
                  { 
                    backgroundColor: colors.background,
                    transform: [{ translateY }],
                    height: isFullScreen ? '100%' : '85%'
                  }
                ]}
              >
                  {/* Header with drag handle - this area handles gestures */}
                  <View 
                    style={[styles.modalHeader, { borderBottomColor: colors.border }]}
                    {...panResponder.panHandlers}
                  >
                    <View style={styles.dragHandle} />
                    <View style={styles.headerContent}>
                      <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                      </TouchableOpacity>
                      <ThemedText variant="h3" color="text" style={styles.headerTitle}>
                        Comments
                      </ThemedText>
                      <View style={styles.headerSpacer} />
                    </View>
                  </View>

                  {/* Scrollable Comments - this area scrolls independently */}
                  <ScrollView 
                    style={styles.modalContent}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    <CommentSection postId={post.id} username={post.profiles?.username} />
                  </ScrollView>
                </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: 'white',
    marginBottom: spacing.sm,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 56, // Fixed height for consistency
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Take available space
    marginRight: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  postImage: {
    width: screenWidth,
    height: Math.min(screenWidth * 0.75, 400), // Better aspect ratio for mobile
    backgroundColor: '#f0f0f0',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  likesSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  likesText: {
    fontWeight: '600',
  },
  contentSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  username: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    paddingTop: 12,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    alignItems: 'center',
    minHeight: 60, // Ensure adequate touch area for gestures
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
  },
});