import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { 
  Alert, 
  Image, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { ProfileService } from '../services/profileService';
import { spacing, ThemedText, useTheme } from '../theme/ui';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentBio: string;
  currentAvatar: string | null;
  onProfileUpdated: (newBio: string, newAvatar: string | null) => void;
}

export default function EditProfileModal({
  visible,
  onClose,
  currentBio,
  currentAvatar,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [bio, setBio] = useState(currentBio);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access media library is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    
    try {
      let newAvatarUrl = currentAvatar;

      // Upload new image if selected
      if (selectedImageUri) {
        const fileName = `profile_${Date.now()}.jpg`;
        const uploadedUrl = await ProfileService.uploadProfileImage(selectedImageUri, fileName);
        
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        } else {
          Alert.alert('Error', 'Failed to upload image');
          return;
        }
      }

      // Update profile
      const success = await ProfileService.updateProfile({
        bio: bio.trim(),
        avatar_url: newAvatarUrl || undefined,
      });

      if (success) {
        onProfileUpdated(bio.trim(), newAvatarUrl);
        handleClose();
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setBio(currentBio);
    setSelectedImageUri(null);
    onClose();
  };

  const displayAvatar = selectedImageUri || currentAvatar;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText variant="h2" color="text" style={styles.title}>
              [User]
            </ThemedText>
          </View>

          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, styles.placeholderImage, { backgroundColor: colors.surface }]}>
                  <ThemedText variant="body" color="textSecondary">
                    Tap to add photo
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>

            {/* Additional UI elements like in the design */}
            <View style={styles.iconRow}>
              <View style={[styles.iconPlaceholder, { backgroundColor: colors.surface }]} />
              <View style={[styles.iconPlaceholder, { backgroundColor: colors.surface }]} />
              <View style={[styles.iconPlaceholder, { backgroundColor: colors.surface }]} />
            </View>
          </View>

          {/* Bio Section */}
          <View style={styles.bioSection}>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              style={[
                styles.bioInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              textAlignVertical="top"
            />
          </View>

          {/* Add extra whitespace to accommodate for the short edit page */}
          <View style={styles.extraSpace} />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { backgroundColor: colors.surface }]}
            onPress={handleClose}
            disabled={isUploading}
          >
            <ThemedText variant="body" color="text">
              Discard Changes
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              { backgroundColor: '#E07A52' }, // Orange color from design
              isUploading && { opacity: 0.6 }
            ]}
            onPress={handleSave}
            disabled={isUploading}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
              {isUploading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  imageContainer: {
    marginBottom: spacing.lg,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
    marginTop: spacing.md,
  },
  iconPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  bioSection: {
    paddingVertical: spacing.lg,
  },
  bioInput: {
    height: 120,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
    lineHeight: 22,
  },
  extraSpace: {
    height: 200, // Add significant whitespace as requested
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    // Styles for cancel button
  },
  saveButton: {
    // Styles for save button
  },
});
