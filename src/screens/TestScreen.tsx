/**
 * Test Screen for debugging friends system
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Container, ThemedText, useTheme } from '../theme/ui';

interface TestUser {
  id: string;
  email?: string;
  username?: string;
  full_name?: string;
  created_at: string;
}

export default function TestScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [users, setUsers] = useState<TestUser[]>([]);

  const addResult = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, message]);
  };

  const runTests = async () => {
    setTestResults([]);
    addResult('Starting friend system tests...');
    
    // Test 1: Check current user
    addResult(`Current user: ${user?.id || 'None'}`);
    addResult(`User email: ${user?.email || 'None'}`);
    addResult(`User metadata: ${JSON.stringify(user?.user_metadata || {})}`);

    // Test 2: Try to fetch all profiles
    try {
      addResult('Fetching all profiles...');
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);

      if (error) {
        addResult(`Error fetching profiles: ${error.message}`);
      } else {
        addResult(`Found ${profiles?.length || 0} profiles`);
        setUsers(profiles || []);
        profiles?.forEach((profile, index) => {
          addResult(`Profile ${index + 1}: ${profile.username || profile.email || profile.id}`);
        });
      }
    } catch (error) {
      addResult(`Exception fetching profiles: ${error}`);
    }

    // Test 3: Try to fetch suggested users
    if (user?.id) {
      try {
        addResult('Testing suggested users query...');
        const { data: suggested, error } = await supabase
          .from('profiles')
          .select('id, email, username, full_name, avatar_url, created_at')
          .neq('id', user.id)
          .limit(5);

        if (error) {
          addResult(`Error fetching suggested users: ${error.message}`);
        } else {
          addResult(`Found ${suggested?.length || 0} suggested users`);
        }
      } catch (error) {
        addResult(`Exception fetching suggested users: ${error}`);
      }
    }

    // Test 4: Check friendships table
    try {
      addResult('Checking friendships table...');
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .limit(5);

      if (error) {
        addResult(`Error fetching friendships: ${error.message}`);
      } else {
        addResult(`Found ${friendships?.length || 0} friendships`);
      }
    } catch (error) {
      addResult(`Exception fetching friendships: ${error}`);
    }
  };

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Container style={styles.content}>
        <ThemedText variant="h2" color="text" style={styles.title}>
          Friend System Debug
        </ThemedText>
        
        <ScrollView style={styles.results}>
          {testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <ThemedText variant="body" color="textSecondary">
                {index + 1}. {result}
              </ThemedText>
            </View>
          ))}
        </ScrollView>

        {users.length > 0 && (
          <View style={styles.usersSection}>
            <ThemedText variant="h3" color="text" style={styles.subtitle}>
              Found Users:
            </ThemedText>
            {users.map((user, index) => (
              <View key={user.id} style={styles.userItem}>
                <ThemedText variant="body" color="text">
                  {user.username || user.email || 'No name'}
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary">
                  {user.full_name || 'No full name'}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  subtitle: {
    marginBottom: 10,
  },
  results: {
    flex: 1,
    marginBottom: 20,
  },
  resultItem: {
    marginBottom: 5,
  },
  usersSection: {
    maxHeight: 200,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
