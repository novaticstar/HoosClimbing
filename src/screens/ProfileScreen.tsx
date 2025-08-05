import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Container, spacing, ThemedText, useTheme } from '../theme/ui';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../hooks/useFriends';
import  { useEffect, useState } from 'react';
import { Modal, TextInput, Button, Text } from 'react-native'; // Add these
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as mime from 'mime';

import Constants from 'expo-constants';
console.log('expoConfig.extra:', Constants.expoConfig?.extra);

export default function ProfileScreen() {
  const extra = Constants.expoConfig?.extra;

if (!extra?.supabaseAnonKey || !extra?.supabaseUrl) {
 
  throw new Error('Missing Supabase keys in expo config!');
}
  const supabaseAnonKey = extra.supabaseAnonKey;
  const supabaseUrl = extra.supabaseUrl;
  const { colors } = useTheme();
  const {friends } = useFriends();
  const { updateProfile } = useAuth();

  const mockPosts = Array(12).fill(require('../../assets/images/splash-icon.png')); // Mock post images
  const { user } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [bio, setBio] = useState('This is a short bio about the user. It can include hobbies, interests, or anything else."');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(
      user?.user_metadata?.avatar_url || null
    );

  async function pickImage() {
    // Ask for permission first (especially on mobile)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted === false) {
      alert("Permission to access media library is required!");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1], // square crop
      quality: 1,
    });
  
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }
  
async function updateBio(newBio: string) {
const { error } = await updateProfile({ bio: newBio }); // newBio is the text from input

  if (error) {
    console.error('Failed to update bio:', error.message);
    // Show error UI
  } else {
    console.log('Bio updated successfully!');
    // Close modal or show success
  }
}

async function fetchBio() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('User not authenticated:', authError);
    return "This is a short bio about the user. It can include hobbies, interests, or anything else.";
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('bio')
    .eq('id', user.id)
    .single(); // because you're fetching only one profile

  if (error) {
    //console.error('Error fetching bio:', error);
    return "This is a short bio about the user. It can include hobbies, interests, or anything else.";
  }

  return data.bio;
}
async function fetchAvatarUrl() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('User not authenticated:', authError);
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching avatar_url:', error);
    return null;
  }

  return data.avatar_url;
}
function base64ToBlob(base64: string, mimeType: string) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
function getMimeType(uri: string) {
  if (uri.endsWith('.jpg') || uri.endsWith('.jpeg')) return 'image/jpeg';
  if (uri.endsWith('.png')) return 'image/png';
  if (uri.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}


  useEffect(() => {
    async function loadData() {
      const fetchedBio = await fetchBio();
      const fetchedAvatar = await fetchAvatarUrl();
      if (fetchedBio) {
        setBio(fetchedBio);
      }
      
      if (fetchedAvatar) setProfilePicture(fetchedAvatar);
    }

    loadData();
  }, []);

  

    return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Container style={styles.content}>
          {/* Profile Header */}
          <View style={styles.header}>
            <Image
              source={
                profilePicture
                  ? { uri: profilePicture }
                  : require('../../assets/images/splash-icon.png')
              }
              style={styles.profilePicture}
            />
            
            <View style={styles.headerInfo}>
              <ThemedText variant="h3" color="text">
                {user?.user_metadata?.username || 'Username'}
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                {bio}
              </ThemedText>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">
                0
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                Posts
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h3" color="text">
                {friends.length}
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                Friends
              </ThemedText>
            </View>
            
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
            <ThemedText variant="body" color="accent">
              Edit Profile
            </ThemedText>
          </TouchableOpacity>

          {/* Posts Grid */}
          <View style={styles.postsGrid}>
            {mockPosts.map((post, index) => (
              <Image key={index} source={post } style={styles.postItem} />
            ))}
          </View>
        </Container>
      </ScrollView>
<Modal visible={modalVisible} animationType="slide" transparent={true}>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Edit Profile</Text>

      <TextInput
        placeholder="Update bio"
        value={bio}
        onChangeText={setBio}
        style={styles.input}
      />

       {/* Profile Pic Preview */}
       {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      ) : (
        <Text>No image selected</Text>
      )}

      {/* Button to open image picker */}
      <TouchableOpacity onPress={pickImage} style={styles.pfp_button}>
        <Text>Pick an image</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button title="Cancel" onPress={() => setModalVisible(false)} />
        <Button title="Save" onPress={async () => {
          // Save logic here (save bio using the bio variable)
          bio? updateBio(bio) : null;
          // Save profile picture logic here
          if (imageUri && user) {
            var blob = null;
            // Ensure file extension (fallback to jpg if none)
            const fileExtMatch = imageUri.match(/\.(\w+)(\?.*)?$/);
            const fileExt = fileExtMatch ? fileExtMatch[1] : 'jpg';
            

            // Generate filename and filepath in Supabase storage
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = fileName;
            try {
              // Fetch image from local URI and convert to blob
              if (Platform.OS === 'web') {
                const response = await fetch(imageUri);
                blob = await response.blob();


                // upload blob
                // Upload to Supabase
              const { data, error: uploadError } = await supabase.storage
              .from('profile-pictures') // bucket name
              .upload(filePath, blob, {
                contentType: blob.type,
                upsert: true,
              });
             if (uploadError) {
              console.error('Upload failed:', uploadError);
            } else {
              const { data: urlData } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(filePath);

              const publicUrl = urlData?.publicUrl;
              console.log('Public URL:', urlData?.publicUrl);
                console.log('File Path:', filePath);
              // Update avatar_url in profile
              const { error: updateError } = await updateProfile({
                avatar_url: publicUrl,
              });
    
              if (updateError) {
                console.error('Failed to update avatar URL:', updateError);
              }
              else{
                // Update local state so header updates immediately:
                await supabase.auth.updateUser({
                  data: { avatar_url: publicUrl }
                });
              setProfilePicture(publicUrl);
              console.log('Profile picture updated successfully:', publicUrl);
              }
            }
              } else {
                        // Supabase upload via fetch
            const file = {
              uri: imageUri,
              name: fileName,
              type: getMimeType(imageUri) || 'image/jpeg',
            };
            const formData = new FormData();
            formData.append('file', file as any);

            const sessionResult = await supabase.auth.getSession();
            const accessToken = sessionResult.data?.session?.access_token;
            console.log("Upload info", {
              imageUri,
              filePath,
              projectUrl: `https://lszaovkgknpurhsjksqu.supabase.co`,
              accessToken: accessToken?.slice(0, 10) + '...',
            });
            console.log("imageURI", imageUri);
            const res = await fetch(`${supabaseUrl}storage/v1/object/profile-pictures/${filePath}`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                apikey: supabaseAnonKey,
                
              },
              body: formData,
            });

            if (!res.ok) {
              const errorText = await res.text();
              console.error('Upload failed:', errorText);
              return;
            }

            const publicUrl = supabase.storage.from('profile-pictures').getPublicUrl(filePath).data.publicUrl;

            // Update user profile
            await updateProfile({ avatar_url: publicUrl });
            await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
            setProfilePicture(publicUrl);
            console.log('Profile picture updated successfully:', publicUrl);

            }      
          }
              
           catch (e) {
              console.error('Error uploading image:', e);
            }
          }
            
          setModalVisible(false);
        }} />
      </View>
    </View>
  </View>
</Modal>

    </SafeAreaView>

    
  );

  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40, // Makes the image circular
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  editButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginBottom: spacing.lg,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  postItem: {
    width: '31%', // Adjust to fit 3 items per row with spacing
    aspectRatio: 1, // Ensures square images
    marginBottom: spacing.sm,
    borderRadius: 8,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  pfp_button: {
    backgroundColor: '#ddd',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  
});