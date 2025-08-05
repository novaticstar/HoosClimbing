/**
 * Create Event Screen - Event creation with image upload
 * Mobile-first design for climbing event creation
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
import { EventService } from '../services/eventsService';
import { uvaColors } from '../theme/colors';
import { borderRadius, spacing, ThemedText, useTheme } from '../theme/ui';

const { width: screenWidth } = Dimensions.get('window');

type Props = {
  onEventCreated?: () => void;
  onClose?: () => void;
};

export default function CreateEventScreen({ onEventCreated, onClose }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 9],
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
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleCreateEvent = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please add a title for your event');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please add a description for your event');
      return;
    }

    if (!eventDate.trim()) {
      Alert.alert('Missing Date', 'Please add a date for your event');
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl: string | undefined;

      // Upload image if selected
      if (selectedImage) {
        setIsUploadingImage(true);
        const fileName = `event_${Date.now()}.jpg`;
        const uploadedUrl = await EventService.uploadEventImage(selectedImage, fileName);
        setIsUploadingImage(false);

        if (!uploadedUrl) {
          Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
          setIsLoading(false);
          return;
        }
        
        imageUrl = uploadedUrl;
      }

      // Combine date and time for event_date
      const combinedDateTime = eventTime ? 
        `${eventDate}T${eventTime}:00` : 
        `${eventDate}T12:00:00`;

      // Create event
      const event = await EventService.createEvent({
        title: title.trim(),
        description: description.trim(),
        event_date: combinedDateTime,
        image_url: imageUrl,
      });

      if (event) {
        Alert.alert('Success', 'Your event has been created!', [
          {
            text: 'OK',
            onPress: () => {
              onEventCreated?.();
              onClose?.();
            },
          },
        ]);
      } else {
        Alert.alert('Error', 'Failed to create event. Please try again.');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setIsUploadingImage(false);
    }
  };

  const isEventValid = title.trim().length > 0 && description.trim().length > 0 && eventDate.trim().length > 0;

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
            New Event
          </ThemedText>
          
          <TouchableOpacity 
            onPress={handleCreateEvent}
            disabled={!isEventValid || isLoading}
            style={[
              styles.headerButton,
              { opacity: (!isEventValid || isLoading) ? 0.5 : 1 }
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <ThemedText variant="button" color="accent">
                Create
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
              <ThemedText variant="caption" color="textSecondary">
                Creating an event
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

          {/* Event Title */}
          <View style={styles.inputSection}>
            <ThemedText variant="body" style={styles.inputLabel}>
              Event Title *
            </ThemedText>
            <TextInput
              style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Give your event a catchy title"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <View style={styles.characterCount}>
              <ThemedText variant="caption" color="textSecondary">
                {title.length}/100
              </ThemedText>
            </View>
          </View>

          {/* Event Description */}
          <View style={styles.inputSection}>
            <ThemedText variant="body" style={styles.inputLabel}>
              Description *
            </ThemedText>
            <TextInput
              style={[styles.descriptionInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Describe what the event is about..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
            <View style={styles.characterCount}>
              <ThemedText variant="caption" color="textSecondary">
                {description.length}/1000
              </ThemedText>
            </View>
          </View>

          {/* Event Date */}
          <View style={styles.inputSection}>
            <ThemedText variant="body" style={styles.inputLabel}>
              Date *
            </ThemedText>
            <TextInput
              style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="YYYY-MM-DD (e.g., 2025-08-15)"
              placeholderTextColor={colors.textSecondary}
              value={eventDate}
              onChangeText={setEventDate}
            />
            <ThemedText variant="caption" color="textSecondary" style={styles.inputHelper}>
              Enter date in YYYY-MM-DD format
            </ThemedText>
          </View>

          {/* Event Time (Optional) */}
          <View style={styles.inputSection}>
            <ThemedText variant="body" style={styles.inputLabel}>
              Time (Optional)
            </ThemedText>
            <TextInput
              style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="HH:MM (e.g., 14:30)"
              placeholderTextColor={colors.textSecondary}
              value={eventTime}
              onChangeText={setEventTime}
            />
            <ThemedText variant="caption" color="textSecondary" style={styles.inputHelper}>
              Enter time in 24-hour format (HH:MM)
            </ThemedText>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={handleImagePicker}
            >
              <Ionicons name="image" size={24} color={uvaColors.cavalierOrange} />
              <ThemedText variant="body" style={styles.actionButtonText}>
                Add Photo from Library
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
  imagePreview: {
    margin: spacing.md,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: (screenWidth - 32) * 9 / 16, // 16:9 aspect ratio
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
  inputSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    minHeight: 48,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  inputHelper: {
    marginTop: spacing.xs,
  },
  actionButtons: {
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.xl,
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
