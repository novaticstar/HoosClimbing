/**
 * Feed Screen
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Container, spacing, ThemedText, useTheme } from '../theme/ui';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function FeedScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  // uncomment these when done mocking!!
  //const [posts, setPosts] = useState<any[]>([]);
  //const [loading, setLoading] = useState(true);

// Commented out to mock posts in feed
  /*useEffect(() => {
    const fetchFeed = async () => {
      const { data, error } = await supabase
        .from('feed')
        .select(`
          id,
          user_id,
          description,
          likes,
          created_at,
          profiles ( username, avatar_url )
        `)
        .order('created_at', { ascending: false }); // or order by likes if preferred

      if (error) {
        console.error('Error fetching feed:', error.message);
      } else {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchFeed();
  }, []);*/

  const mockPosts = [
    {
      id: '1',
      user_id: 'user-1',
      profiles: {
        username: 'alexclimbs',
        avatar_url: null,
      },
      description: 'Sent my first V5 today at the indoor wall!',
      likes: 12,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'user-2',
      profiles: {
        username: 'gripmaster22',
        avatar_url: null,
      },
      description: 'Outdoor bouldering at Humpback — what a view 🌄',
      likes: 27,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: '3',
      user_id: 'user-3',
      profiles: {
        username: 'chalky',
        avatar_url: null,
      },
      description: 'Who needs skin anyway?',
      likes: 8,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
  ];

  const [posts, setPosts] = useState(mockPosts);
  const [loading, setLoading] = useState(false);

// Commented to view mocked like button!
  /*const handleLike = async (postId: string, currentLikes: number) => {
    const { error } = await supabase
      .from('feed')
      .update({ likes: currentLikes + 1 })
      .eq('id', postId);

    if (!error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: p.likes + 1 } : p
        )
      );
    } else {
      console.error('Error updating likes:', error.message);
    }
  };*/

  const handleLike = (postId: string, currentLikes: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      )
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container style={styles.content}>
          <ThemedText variant="h2" color="text" style={styles.title}>
            Feed
          </ThemedText>

          {loading ? (
            <ActivityIndicator color={colors.accent} size="large" />
          ) : posts.length === 0 ? (
            <Card style={styles.card}>
              <ThemedText variant="body" color="textSecondary">
                No posts found.
              </ThemedText>
              <TouchableOpacity>
                <ThemedText variant="body" color="accent">
                  Be the first to post →
                </ThemedText>
              </TouchableOpacity>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} style={styles.postCard}>
                {/* Header */}
                <View style={styles.postHeader}>
                  <ThemedText variant="h4" color="text">
                    {post.profiles?.username || 'Anonymous'}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    {new Date(post.created_at).toLocaleString()}
                  </ThemedText>
                </View>

                {/* Content */}
                <View style={styles.postContent}>
                  <ThemedText variant="body" color="text">
                    {post.description}
                  </ThemedText>
                </View>

                {/* Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity
                    onPress={() => handleLike(post.id, post.likes)}
                    style={styles.actionButton}
                  >
                    <Ionicons
                      name="heart-outline"
                      size={20}
                      color={colors.accent}
                    />
                    <ThemedText
                      variant="body"
                      color="accent"
                      style={styles.likeText}
                    >
                      {post.likes}
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <ThemedText variant="body" color="textSecondary">
                      Comment
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
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
  title: {
    marginBottom: spacing.lg,
  },
  postCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  postHeader: {
    marginBottom: spacing.sm,
  },
  postContent: {
    marginBottom: spacing.sm,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  likeText: {
    marginLeft: spacing.xs,
  },
  card: {
    marginBottom: spacing.lg,
  },
});
