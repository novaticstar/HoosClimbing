import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ThemedText, useTheme } from '../theme/ui';

type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: number;
};

export const Avatar = ({ uri, name, size = 50 }: AvatarProps) => {
  const { colors } = useTheme();
  const [error, setError] = useState(false);

  const getInitials = () => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  if (uri && !error) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.accent,
        },
      ]}
    >
      <ThemedText variant="h4" color="onPrimary">
        {getInitials()}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});