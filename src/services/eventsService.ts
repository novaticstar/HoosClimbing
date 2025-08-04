/**
 * Events Service
 * Handles database operations related to events
 */

import { supabase } from '../lib/supabase';

export interface EventItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  event_date: string;
  image_path?: string | null;
  profiles?: {
    username: string;
  };
}