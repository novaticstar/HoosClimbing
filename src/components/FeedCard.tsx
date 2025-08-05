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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { FeedStackParamList } from '../navigation/FeedStack';
import { CommentService } from '../services/commentsService';
import { spacing, ThemedText, useTheme } from '../theme/ui';
import { CommentSection } from './CommentSection';
import { UserTaggingInput } from './UserTaggingInput';

type FeedCardNavigationProp = StackNavigationProp<FeedStackParamList>;

type FeedCardProps = {
  post: any;
  onLike: (postId: string, hasLiked: boolean) => void;
};

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export const FeedCard = ({ post, onLike }: FeedCardProps) => {
  const { colors } = useTheme();
  const navigation = useNavigation<FeedCardNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [refreshComments, setRefreshComments] = useState(0);
  
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
    // Animate modal slide down smoothly - ensure it goes all the way
    Animated.timing(translateY, {
      toValue: screenWidth * 1.2, // Go beyond screen to ensure full dismissal
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      // Reset translateY after animation completes
      translateY.setValue(screenWidth);
    });
    
    // Animate background fade out slightly faster
    Animated.timing(backgroundOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setShowCommentsModal(false);
      setIsFullScreen(false); // Reset full screen state
    });
  };
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Respond to both up and down movements 
        const { dy, dx } = gestureState;
        return Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx) * 1.5;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // Capture both up and down gestures
        const { dy, dx } = gestureState;
        return Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.5;
      },
      onPanResponderGrant: () => {
        // Store the starting value for smooth continuation
        translateY.extractOffset();
        panStartValue.current = 0;
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dy } = gestureState;
        
        if (dy > 0) {
          // Moving down - allow closing with smooth following
          const newValue = dy * 0.85;
          translateY.setValue(Math.max(0, newValue));
        } else if (dy < 0) {
          // Moving up - allow expanding or collapsing
          if (!isFullScreen) {
            // Expanding to full screen
            const resistedValue = dy * 0.6;
            translateY.setValue(Math.max(-100, resistedValue));
          } else {
            // Already full screen, allow slight upward movement
            const resistedValue = dy * 0.3;
            translateY.setValue(Math.max(-50, resistedValue));
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dy, vy } = gestureState;
        
        if (dy > 50 || vy > 0.3) {
          // Close the modal - swipe down
          closeModal();
        } else if (dy < -80 || vy < -0.5) {
          // Expand to full screen or collapse from full screen
          if (!isFullScreen) {
            setIsFullScreen(true);
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 120,
              friction: 8,
            }).start();
          }
        } else if (isFullScreen && dy > 30) {
          // Collapse from full screen when pulling down slightly
          setIsFullScreen(false);
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
          }).start();
        } else {
          // Snap back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;
    const success = await CommentService.addCommentWithAutoTagging(post.id, user.id, commentText.trim());
    if (success) {
      setCommentText('');
      setRefreshComments(prev => prev + 1); // Trigger refresh in CommentSection
    }
  };

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

      {/* Post Image - only show if image exists */}
      {post.image_url && (
        <Image
          source={{ uri: post.image_url }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Post Content - Show text posts differently */}
      {!post.image_url && post.description && (
        <View style={[styles.textOnlyPost, { backgroundColor: colors.surfaceVariant }]}>
          <ThemedText variant="body" color="text" style={styles.textOnlyContent}>
            {post.description}
          </ThemedText>
        </View>
      )}

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
                    height: isFullScreen ? screenHeight - insets.top : screenHeight * 0.6,
                    marginTop: isFullScreen ? insets.top : 0,
                  }
                ]}
              >
                  {/* Header with drag handle and tap to expand */}
                  <TouchableOpacity
                    style={[styles.modalHeader, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      if (!isFullScreen) {
                        setIsFullScreen(true);
                        Animated.spring(translateY, {
                          toValue: 0,
                          useNativeDriver: true,
                          tension: 120,
                          friction: 8,
                        }).start();
                      } else {
                        setIsFullScreen(false);
                        Animated.spring(translateY, {
                          toValue: 0,
                          useNativeDriver: true,
                          tension: 120,
                          friction: 8,
                        }).start();
                      }
                    }}
                    activeOpacity={0.9}
                    {...panResponder.panHandlers}
                  >
                    <View style={[styles.dragHandle, { backgroundColor: colors.textSecondary }]} />
                    <View style={styles.headerContent}>
                      <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                      </TouchableOpacity>
                      <ThemedText variant="h3" color="text" style={styles.headerTitle}>
                        Comments
                      </ThemedText>
                      <TouchableOpacity 
                        style={styles.expandButton}
                        onPress={() => {
                          if (!isFullScreen) {
                            setIsFullScreen(true);
                            Animated.spring(translateY, {
                              toValue: 0,
                              useNativeDriver: true,
                              tension: 120,
                              friction: 8,
                            }).start();
                          } else {
                            // Collapse from full screen back to 60%
                            setIsFullScreen(false);
                            Animated.spring(translateY, {
                              toValue: 0,
                              useNativeDriver: true,
                              tension: 120,
                              friction: 8,
                            }).start();
                          }
                        }}
                      >
                        <Ionicons 
                          name={isFullScreen ? "chevron-down" : "chevron-up"} 
                          size={20} 
                          color={colors.textSecondary} 
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>

                  {/* Scrollable Comments - flex to take remaining space */}
                  <ScrollView 
                    style={styles.commentsScrollView}
                    contentContainerStyle={styles.commentsContainer}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    keyboardShouldPersistTaps="handled"
                    directionalLockEnabled={true}
                    scrollEventThrottle={16}
                    nestedScrollEnabled={true}
                  >
                    <CommentSection 
                      postId={post.id} 
                      username={post.profiles?.username}
                      refreshTrigger={refreshComments}
                    />
                  </ScrollView>

                  {/* Fixed Comment Input at Bottom */}
                  <View style={[
                    styles.commentInputContainer, 
                    { 
                      backgroundColor: colors.background,
                      borderTopColor: colors.border,
                      paddingBottom: Math.max(insets.bottom, spacing.sm)
                    }
                  ]}>
                    <UserTaggingInput
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="Add a comment..."
                      onSend={handleAddComment}
                      maxLength={500}
                      multiline={true}
                    />
                  </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingTop: 12,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    alignItems: 'center',
    minHeight: 60,
  },
  dragHandle: {
    width: 40,
    height: 4,
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
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  expandButton: {
    padding: spacing.xs,
    width: 40,
    alignItems: 'center',
  },
  commentsScrollView: {
    flex: 1,
  },
  commentsContainer: {
    flexGrow: 1,
  },
  commentInputContainer: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 40,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  postButton: {
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.xs,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    fontWeight: '600',
  },
  textOnlyPost: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    minHeight: 120,
    justifyContent: 'center',
  },
  textOnlyContent: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
});