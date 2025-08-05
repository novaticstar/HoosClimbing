/**
 * User Tagging Input Component
 * Supports @mentions in comments and posts
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { FeedService, TaggedUser } from '../services/feedService';
import { borderRadius, spacing, ThemedText, useTheme } from '../theme/ui';

interface UserTaggingInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSend?: () => void;
  maxLength?: number;
  multiline?: boolean;
  disabled?: boolean;
}

export const UserTaggingInput: React.FC<UserTaggingInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Add a comment...',
  onSend,
  maxLength = 500,
  multiline = true,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [searchResults, setSearchResults] = useState<TaggedUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionStart, setMentionStart] = useState(-1);

  const handleTextChange = async (text: string) => {
    onChangeText(text);

    // Check for @ symbol for user tagging
    const atIndex = text.lastIndexOf('@');
    
    if (atIndex >= 0) {
      const beforeAt = text.substring(0, atIndex);
      const afterAt = text.substring(atIndex + 1);
      
      // Check if @ is at start or preceded by space
      const isValidMention = atIndex === 0 || beforeAt[beforeAt.length - 1] === ' ';
      
      if (isValidMention && !afterAt.includes(' ')) {
        // We have a potential mention
        setMentionStart(atIndex);
        
        if (afterAt.length >= 1) {
          // Search for users
          const users = await FeedService.searchUsers(afterAt);
          setSearchResults(users);
          setShowSuggestions(users.length > 0);
        } else {
          setSearchResults([]);
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
        setMentionStart(-1);
      }
    } else {
      setShowSuggestions(false);
      setMentionStart(-1);
    }
  };

  const handleUserSelect = (user: TaggedUser) => {
    if (mentionStart >= 0) {
      const beforeMention = value.substring(0, mentionStart);
      const afterMention = value.substring(value.indexOf('@', mentionStart) + 1);
      const spaceIndex = afterMention.indexOf(' ');
      const afterUsername = spaceIndex >= 0 ? afterMention.substring(spaceIndex) : '';
      
      const newText = `${beforeMention}@${user.username}${afterUsername}`;
      onChangeText(newText);
    }
    
    setShowSuggestions(false);
    setMentionStart(-1);
    setSearchResults([]);
  };

  const renderUserSuggestion = ({ item }: { item: TaggedUser }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
      onPress={() => handleUserSelect(item)}
    >
      <View style={[styles.suggestionAvatar, { backgroundColor: colors.surfaceVariant }]}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.suggestionAvatarImage} />
        ) : (
          <Ionicons name="person" size={16} color={colors.textSecondary} />
        )}
      </View>
      <ThemedText variant="body">@{item.username}</ThemedText>
    </TouchableOpacity>
  );

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      {/* User Suggestions */}
      {showSuggestions && searchResults.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FlatList
            data={searchResults}
            renderItem={renderUserSuggestion}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Input Row */}
      <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
        <TextInput
          value={value}
          onChangeText={handleTextChange}
          style={[styles.textInput, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={multiline}
          maxLength={maxLength}
          editable={!disabled}
        />
        
        {onSend && (
          <TouchableOpacity 
            onPress={onSend} 
            disabled={!canSend}
            style={[
              styles.sendButton,
              { 
                backgroundColor: canSend ? colors.accent : colors.surfaceVariant,
                opacity: canSend ? 1 : 0.5,
              }
            ]}
          >
            <Ionicons 
              name="send" 
              size={16} 
              color={canSend ? "white" : colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  suggestionAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  suggestionAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
