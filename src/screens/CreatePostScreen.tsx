/**
 * Create Post Screen - Matches reference design
 * Mobile-first design with user tagging functionality
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { FeedService, TaggedUser } from '../services/feedService';
import { uvaColors } from '../theme/colors';
import { borderRadius, spacing, ThemedText, useTheme } from '../theme/ui';

const { width: screenWidth } = Dimensions.get('window');

type Props = {
  onPostCreated?: (postId: string) => void; // Updated to pass postId
  onClose?: () => void;
};

export default function CreatePostScreen({ onPostCreated, onClose }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TaggedUser[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<TaggedUser[]>([]);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = await FeedService.searchUsers(query);
    const filteredResults = results.filter(
      user => !taggedUsers.some(tagged => tagged.id === user.id)
    );
    setSearchResults(filteredResults);
  };

  const handleCreatePost = async () => {
    if (isLoading) return; // Prevent multiple submissions
    
    if (!title.trim() && !description.trim() && !selectedImage) {
      Alert.alert('Error', 'Please add a title, description, or image');
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl: string | undefined;
      
      if (selectedImage) {
        const fileName = `post-${Date.now()}.jpg`;
        const uploadedUrl = await FeedService.uploadImage(selectedImage, fileName);
        
        if (!uploadedUrl) {
          Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
          setIsLoading(false);
          return;
        }
        
        imageUrl = uploadedUrl;
      }

      // Combine title and description
      const fullDescription = title.trim() ? `${title.trim()}\n${description.trim()}` : description.trim();

      const post = await FeedService.createPost({
        description: fullDescription,
        image_url: imageUrl,
        tagged_users: taggedUsers.map(user => user.id),
      });

      if (post) {
        Alert.alert('Success', 'Your post has been created!', [
          {
            text: 'View Post',
            onPress: () => {
              onPostCreated?.(post.id);
              onClose?.();
            },
          },
          {
            text: 'OK',
            onPress: () => {
              onPostCreated?.(post.id);
              onClose?.();
            },
          },
        ]);
      } else {
        Alert.alert('Error', 'Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addUserTag = (user: TaggedUser) => {
    setTaggedUsers(prev => [...prev, user]);
    setSearchQuery('');
    setSearchResults([]);
    setShowUserSearch(false);
  };

  const removeUserTag = (userId: string) => {
    setTaggedUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText variant="h3" color="text" style={styles.headerTitle}>
            Upload Post
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Upload Section */}
          <View style={[styles.imageSection, { backgroundColor: colors.surfaceVariant }]}>
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity 
                  onPress={() => setSelectedImage(null)}
                  style={[styles.removeImageButton, { backgroundColor: colors.background }]}
                >
                  <Ionicons name="close" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={[styles.uploadIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name="image" size={32} color={colors.textSecondary} />
                </View>
                <View style={styles.uploadIcons}>
                  <TouchableOpacity 
                    onPress={handleImagePicker}
                    style={[styles.uploadOption, { backgroundColor: colors.surface }]}
                  >
                    <Ionicons name="image" size={20} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleCameraCapture}
                    style={[styles.uploadOption, { backgroundColor: colors.surface }]}
                  >
                    <Ionicons name="camera" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Post Content */}
          <View style={styles.contentSection}>
            <TextInput
              style={[styles.titleInput, { 
                color: colors.text, 
                backgroundColor: colors.surface,
                borderColor: colors.border 
              }]}
              placeholder="Post Title"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            
            <TextInput
              style={[styles.descriptionInput, { 
                color: colors.text, 
                backgroundColor: colors.surface,
                borderColor: colors.border 
              }]}
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          {/* Tag Friends Section */}
          <View style={styles.tagSection}>
            <View style={styles.tagHeader}>
              <ThemedText variant="h4" color="text" style={styles.tagTitle}>
                Tag Friends
              </ThemedText>
              <TouchableOpacity 
                onPress={() => setShowUserSearch(!showUserSearch)}
                style={[styles.addTagButton, { backgroundColor: colors.accent }]}
              >
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
            </View>

            {/* Tagged Users Display */}
            {taggedUsers.length > 0 && (
              <View style={styles.taggedUsersContainer}>
                {taggedUsers.map((user) => (
                  <View key={user.id} style={[styles.taggedUserChip, { backgroundColor: colors.surface }]}>
                    <View style={[styles.userAvatar, { backgroundColor: colors.surfaceVariant }]}>
                      <Ionicons name="person" size={16} color={colors.text} />
                    </View>
                    <ThemedText variant="body" color="text" style={styles.taggedUserName}>
                      {user.username}
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() => removeUserTag(user.id)}
                      style={styles.removeTagButton}
                    >
                      <Ionicons name="close" size={12} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* User Search */}
            {showUserSearch && (
              <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search users..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    searchUsers(text);
                  }}
                />
                {searchResults.length > 0 && (
                  <View style={styles.searchResults}>
                    {searchResults.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                        onPress={() => addUserTag(user)}
                      >
                        <View style={[styles.userAvatar, { backgroundColor: colors.surfaceVariant }]}>
                          <Ionicons name="person" size={16} color={colors.text} />
                        </View>
                        <ThemedText variant="body" color="text">
                          @{user.username}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={[styles.bottomActions, { 
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom || spacing.md
        }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.surface }]}
            onPress={onClose}
            disabled={isLoading}
          >
            <ThemedText variant="body" color="text" style={styles.buttonText}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.shareButton, { 
              backgroundColor: uvaColors.cavalierOrange,
              opacity: isLoading ? 0.6 : 1 
            }]}
            onPress={handleCreatePost}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <ThemedText variant="body" color="onAccent" style={styles.buttonText}>
                Upload Post
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: spacing.xs,
    width: 40,
  },
  headerTitle: {
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageSection: {
    height: 240,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcons: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  uploadOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 50,
  },
  descriptionInput: {
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  tagSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  tagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  tagTitle: {
    fontWeight: '600',
  },
  addTagButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taggedUsersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  taggedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taggedUserName: {
    fontSize: 14,
  },
  removeTagButton: {
    padding: 2,
  },
  searchContainer: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  searchInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  searchResults: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
