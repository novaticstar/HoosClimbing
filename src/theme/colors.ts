/**
 * University of Virginia Color Palette
 * Based on official UVA brand guidelines
 */

// UVA Brand Colors
export const uvaColors = {
  // Primary brand colors
  jeffersonBlue: '#232D4B',     // Jefferson Blue - Primary
  cavalierOrange: '#F84C1E',    // Cavalier Orange - Accent
  
  // Extended palette
  white: '#FFFFFF',
  black: '#000000',
  
  // Grays
  charcoal: '#2C3E50',
  slate: '#5A6C7D',
  silver: '#BDC3C7',
  lightGray: '#F8F9FA',
  
  // Status colors
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  // Transparent variants
  jeffersonBlueAlpha: (alpha: number) => `rgba(35, 45, 75, ${alpha})`,
  cavalierOrangeAlpha: (alpha: number) => `rgba(248, 76, 30, ${alpha})`,
} as const;

// Theme color mappings
export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  
  // Primary colors
  primary: string;
  onPrimary: string;
  
  // Accent colors
  accent: string;
  onAccent: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textOnSurface: string;
  
  // Border colors
  border: string;
  borderFocus: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Interactive states
  disabled: string;
  onDisabled: string;
  
  // Shadow
  shadow: string;
}

export const colors = {
  light: {
    // Background colors
    background: uvaColors.white,
    surface: uvaColors.white,
    surfaceVariant: uvaColors.lightGray,
    
    // Primary colors
    primary: uvaColors.jeffersonBlue,
    onPrimary: uvaColors.white,
    
    // Accent colors
    accent: uvaColors.cavalierOrange,
    onAccent: uvaColors.white,
    
    // Text colors
    text: uvaColors.jeffersonBlue,
    textSecondary: uvaColors.slate,
    textOnSurface: uvaColors.charcoal,
    
    // Border colors
    border: uvaColors.silver,
    borderFocus: uvaColors.cavalierOrange,
    
    // Status colors
    success: uvaColors.success,
    warning: uvaColors.warning,
    error: uvaColors.error,
    info: uvaColors.info,
    
    // Interactive states
    disabled: uvaColors.silver,
    onDisabled: uvaColors.slate,
    
    // Shadow
    shadow: uvaColors.jeffersonBlueAlpha(0.1),
  } as ThemeColors,
  
  dark: {
    // Background colors
    background: uvaColors.charcoal,
    surface: uvaColors.slate,
    surfaceVariant: uvaColors.jeffersonBlueAlpha(0.8),
    
    // Primary colors
    primary: uvaColors.cavalierOrange,
    onPrimary: uvaColors.white,
    
    // Accent colors
    accent: uvaColors.cavalierOrange,
    onAccent: uvaColors.white,
    
    // Text colors
    text: uvaColors.white,
    textSecondary: uvaColors.silver,
    textOnSurface: uvaColors.lightGray,
    
    // Border colors
    border: uvaColors.slate,
    borderFocus: uvaColors.cavalierOrange,
    
    // Status colors
    success: uvaColors.success,
    warning: uvaColors.warning,
    error: uvaColors.error,
    info: uvaColors.info,
    
    // Interactive states
    disabled: uvaColors.slate,
    onDisabled: uvaColors.silver,
    
    // Shadow
    shadow: uvaColors.black,
  } as ThemeColors,
} as const;
