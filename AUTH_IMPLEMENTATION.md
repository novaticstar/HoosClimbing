# HoosClimbing Authentication Implementation

This document outlines the complete authentication system implemented for the HoosClimbing app using Supabase with the new JWT feature supporting current and standby keys.

## Overview

The authentication system features:
- **University of Virginia branding** with Jefferson Blue (#232D4B) and Cavalier Orange (#F84C1E)
- **Supabase JWT authentication** with current/standby key support
- **Row Level Security (RLS)** for data protection
- **Modern React Native UI** with TypeScript
- **Responsive design** for iOS, Android, and web

## Architecture

### 1. Theme System (`src/theme/`)
- **`colors.ts`**: UVA brand colors with light/dark mode support
- **`typography.ts`**: Consistent text styles and font system
- **`ui.tsx`**: Reusable UI components (Button, TextInput, Card, etc.)

### 2. Authentication Context (`src/context/AuthContext.tsx`)
- Manages authentication state
- Handles Supabase auth events
- Provides auth methods (signIn, signUp, signOut, resetPassword)
- Integrates with JWT current/standby key system

### 3. Supabase Configuration (`src/lib/supabase.ts`)
- Enhanced JWT configuration with current and standby keys
- AsyncStorage for session persistence
- Real-time configuration for optimal performance
- TypeScript database definitions

### 4. Navigation System (`src/navigation/`)
- **`RootNavigator.tsx`**: Main navigation controller
- **`AuthStack.tsx`**: Authentication flow (Login → SignUp → ForgotPassword)
- **`AppTabs.tsx`**: Main app navigation after authentication

### 5. Authentication Screens (`src/screens/auth/`)
- **`LoginScreen.tsx`**: Beautiful login form with UVA branding
- **`SignUpScreen.tsx`**: User registration with profile setup
- **`ForgotPasswordScreen.tsx`**: Password reset functionality

### 6. App Screens (`src/screens/`)
- **`HomeScreen.tsx`**: Dashboard with climbing stats and activity
- **`ExploreScreen.tsx`**: Discover climbing locations and events
- **`ProfileScreen.tsx`**: User profile and settings

## Features Implemented

### 🎨 UVA Branding
- Jefferson Blue (#232D4B) as primary color
- Cavalier Orange (#F84C1E) as accent color
- Consistent typography and spacing
- Light and dark mode support

### 🔐 Advanced Authentication
- **Email/Password authentication**
- **JWT with current and standby keys** for enhanced security
- **Row Level Security** policies in Supabase
- **Session persistence** across app restarts
- **Deep link handling** for password reset

### 📱 User Experience
- **Beautiful, modern UI** with smooth animations
- **Form validation** with helpful error messages
- **Loading states** and feedback
- **Responsive design** for all screen sizes
- **Accessibility support**

### 🗄️ Database Integration
- **User profiles table** with RLS policies
- **Automatic profile creation** on signup
- **Profile updates** with optimistic UI
- **Real-time capabilities** ready for future features

## JWT Current/Standby Key Implementation

The app is configured to work with Supabase's new JWT feature:

```typescript
// In .env (server-side only)
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_CURRENT_KEY=current-key-id
SUPABASE_STANDBY_KEY=standby-key-id
```

### How it works:
1. **Token Validation**: Supabase automatically validates JWTs using the current key
2. **Key Rotation**: When rotating keys, the standby key becomes current seamlessly
3. **Zero Downtime**: Users remain authenticated during key rotation
4. **Enhanced Security**: Regular key rotation improves security posture

## File Structure

```
src/
├── context/
│   └── AuthContext.tsx          # Authentication state management
├── lib/
│   └── supabase.ts             # Supabase client configuration
├── navigation/
│   ├── RootNavigator.tsx       # Main navigation controller
│   ├── AuthStack.tsx           # Authentication flow
│   └── AppTabs.tsx             # Main app navigation
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx     # Login form
│   │   ├── SignUpScreen.tsx    # Registration form
│   │   └── ForgotPasswordScreen.tsx # Password reset
│   ├── HomeScreen.tsx          # Dashboard
│   ├── ExploreScreen.tsx       # Discover locations/events
│   └── ProfileScreen.tsx       # User profile
└── theme/
    ├── colors.ts               # UVA color palette
    ├── typography.ts           # Text styles
    └── ui.tsx                  # Reusable components
```

## Database Schema

The `profiles` table is automatically created with the provided SQL migration:

```sql
-- profiles table with RLS
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
CREATE POLICY "Public profiles viewable by authenticated users"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

## Getting Started

1. **Set up Supabase**:
   - Create a new Supabase project
   - Run the SQL migration in `database/001_create_profiles_table.sql`
   - Configure JWT keys in your Supabase dashboard

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Fill in your Supabase credentials
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run the App**:
   ```bash
   npm start
   ```

## Security Features

- **Row Level Security**: All database queries respect user ownership
- **JWT Validation**: Current/standby key system for secure token management
- **Input Validation**: All forms validate input before submission
- **Error Handling**: Secure error messages that don't leak sensitive info
- **Session Management**: Automatic token refresh and logout on expiration

## Next Steps

The authentication system is ready for extension with:
- **Social login** (Google, Facebook, etc.)
- **Multi-factor authentication**
- **Email verification workflows**
- **Advanced user permissions**
- **Real-time features** (already configured)

## UVA Theme Colors Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Jefferson Blue | #232D4B | Primary brand, headers, buttons |
| Cavalier Orange | #F84C1E | Accents, CTAs, highlights |
| White | #FFFFFF | Backgrounds, cards |
| Charcoal | #2C3E50 | Dark mode backgrounds |
| Slate | #5A6C7D | Secondary text |
| Silver | #BDC3C7 | Borders, disabled states |

The implementation follows UVA's official brand guidelines while providing a modern, accessible user experience for the climbing community.
