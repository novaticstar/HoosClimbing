/**
 * Create Post Screen - Instagram-style post creation
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { FeedService, TaggedUser } from '../services/feedService';
import { uvaColors } from '../theme/colors';
import { borderRadius, spacing, ThemedText, useTheme } from '../theme/ui';

const { width: screenWidth } = Dimensions.get('window');

type Props = {
  onPostCreated?: () => void;
  onClose?: () => void;
};

export default function CreatePostScreen({ onPostCreated, onClose }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
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
      aspect: [1, 1],
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
    // Filter out already tagged users
    const filteredResults = results.filter(
      user => !taggedUsers.some(tagged => tagged.id === user.id)
    );
    setSearchResults(filteredResults);
  };

  const handleUserTag = (user: TaggedUser) => {
    setTaggedUsers(prev => [...prev, user]);
    setSearchQuery('');
    setSearchResults([]);
    setShowUserSearch(false);
  };

  const removeUserTag = (userId: string) => {
    setTaggedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleCreatePost = async () => {
    if (!description.trim() && !selectedImage) {
      Alert.alert('Empty Post', 'Please add some content or an image to your post');
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl: string | undefined;

      // Upload image if selected
      if (selectedImage) {
        setIsUploadingImage(true);
        const fileName = `post_${Date.now()}.jpg`;
        const uploadedUrl = await FeedService.uploadImage(selectedImage, fileName);
        setIsUploadingImage(false);

        if (!uploadedUrl) {
          Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
          setIsLoading(false);
          return;
        }
        
        imageUrl = uploadedUrl;
      }

      // Create post with tagged users
      const post = await FeedService.createPost({
        description: description.trim(),
        image_url: imageUrl,
        tagged_users: taggedUsers.map(user => user.id),
      });

      if (post) {
        Alert.alert('Success', 'Your post has been created!', [
          {
            text: 'OK',
            onPress: () => {
              onPostCreated?.();
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
      setIsUploadingImage(false);
    }
  };

  const isPostValid = description.trim().length > 0 || selectedImage;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <ThemedText variant="h3" style={styles.headerTitle}>
            New Post
          </ThemedText>
          
          <TouchableOpacity 
            onPress={handleCreatePost}
            disabled={!isPostValid || isLoading}
            style={[
              styles.headerButton,
              { opacity: (!isPostValid || isLoading) ? 0.5 : 1 }
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <ThemedText variant="button" color="accent">
                Share
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceVariant }]}>
              {user?.user_metadata?.avatar_url ? (
                <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={24} color={colors.textSecondary} />
              )}
            </View>
            <View style={styles.userDetails}>
              <ThemedText variant="body" style={styles.username}>
                {user?.user_metadata?.username || 'Anonymous'}
              </ThemedText>
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.inputSection}>
            <TextInput
              style={[styles.descriptionInput, { color: colors.text }]}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={2200}
              textAlignVertical="top"
            />
            
            <View style={styles.characterCount}>
              <ThemedText variant="caption" color="textSecondary">
                {description.length}/2200
              </ThemedText>
            </View>
          </View>

          {/* Selected Image Preview */}
          {selectedImage && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color="white" />
              </TouchableOpacity>
              {isUploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="white" />
                  <ThemedText variant="caption" style={styles.uploadingText}>
                    Uploading...
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {/* Tagged Users */}
          {taggedUsers.length > 0 && (
            <View style={styles.taggedUsersSection}>
              <ThemedText variant="body" style={styles.sectionTitle}>
                Tagged Users
              </ThemedText>
              <View style={styles.taggedUsersList}>
                {taggedUsers.map((user) => (
                  <View key={user.id} style={[styles.taggedUser, { backgroundColor: colors.surfaceVariant }]}>
                    <ThemedText variant="caption">@{user.username}</ThemedText>
                    <TouchableOpacity onPress={() => removeUserTag(user.id)}>
                      <Ionicons name="close" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* User Search */}
          {showUserSearch && (
            <View style={[styles.userSearchSection, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Search users to tag..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchUsers(text);
                }}
                autoFocus
              />
              
              {searchResults.length > 0 && (
                <View style={styles.searchResults}>
                  {searchResults.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                      onPress={() => handleUserTag(user)}
                    >
                      <View style={[styles.searchUserAvatar, { backgroundColor: colors.surfaceVariant }]}>
                        {user.avatar_url ? (
                          <Image source={{ uri: user.avatar_url }} style={styles.searchUserAvatarImage} />
                        ) : (
                          <Ionicons name="person" size={16} color={colors.textSecondary} />
                        )}
                      </View>
                      <ThemedText variant="body">@{user.username}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={handleImagePicker}
            >
              <Ionicons name="image" size={24} color={uvaColors.cavalierOrange} />
              <ThemedText variant="body" style={styles.actionButtonText}>
                Photo Library
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={handleCameraCapture}
            >
              <Ionicons name="camera" size={24} color={uvaColors.jeffersonBlue} />
              <ThemedText variant="body" style={styles.actionButtonText}>
                Take Photo
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => setShowUserSearch(!showUserSearch)}
            >
              <Ionicons name="person-add" size={24} color={uvaColors.cavalierOrange} />
              <ThemedText variant="body" style={styles.actionButtonText}>
                Tag Users
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: spacing.xs,
    minWidth: 60,
  },
  headerTitle: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
  },
  inputSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  descriptionInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  imagePreview: {
    margin: spacing.md,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: screenWidth - 32,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  uploadingText: {
    color: 'white',
    marginTop: spacing.sm,
  },
  taggedUsersSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  taggedUsersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  taggedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  userSearchSection: {
    margin: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  searchResults: {
    marginTop: spacing.sm,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  searchUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  searchUserAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  actionButtons: {
    padding: spacing.md,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  actionButtonText: {
    fontWeight: '500',
  },
});
