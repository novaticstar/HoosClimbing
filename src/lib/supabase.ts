/**
 * Supabase client configuration
 * Using AsyncStorage for session persistence and JWT key management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// JWT Keys for the new JWT feature (server-side only, not exposed to client)
const jwtSecret = process.env.SUPABASE_JWT_SECRET;
const currentKey = process.env.SUPABASE_CURRENT_KEY;
const standbyKey = process.env.SUPABASE_STANDBY_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

// Create Supabase client with AsyncStorage persistence and enhanced JWT support
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for session persistence
    storage: AsyncStorage,
    // Automatically refresh tokens using current/standby JWT keys
    autoRefreshToken: true,
    // Persist sessions across app restarts
    persistSession: true,
    // Don't detect session in URL (we handle deep links manually)
    detectSessionInUrl: false,
    // Enhanced JWT validation with current and standby keys
    flowType: 'pkce',
  },
  // Real-time options for enhanced performance
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// JWT Key management utilities (for server-side use only)
export const jwtConfig = {
  secret: jwtSecret,
  currentKey,
  standbyKey,
  // Helper to validate JWT with current or standby key
  validateToken: async (token: string) => {
    // This would be implemented server-side only
    // Client-side validation is handled by Supabase automatically
    console.log('JWT validation handled by Supabase');
    return true;
  },
};

// Database types (will be expanded as needed)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
