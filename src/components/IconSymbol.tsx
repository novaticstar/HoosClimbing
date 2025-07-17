/**
 * Basic Icon Symbol component for AppTabs
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface IconSymbolProps {
  name: string;
  size?: number;
  color: string;
}

export function IconSymbol({ name, size = 24, color }: IconSymbolProps) {
  // Map the expo-symbols names to Ionicons names
  const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'house.fill': 'home',
    'paperplane.fill': 'send',
    'chevron.left.forwardslash.chevron.right': 'code-slash',
    'person.fill': 'person',
  };

  const ioniconsName = iconMap[name] || 'help-circle';

  return (
    <Ionicons
      name={ioniconsName}
      size={size}
      color={color}
    />
  );
}
