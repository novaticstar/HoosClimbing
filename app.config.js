import 'dotenv/config';

export default ({ config }) => ({
    ...config,
    extra: {
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    },
  });