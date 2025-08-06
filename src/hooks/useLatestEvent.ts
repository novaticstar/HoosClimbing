/**
 * useLatestEvent Hook
 * Custom hook for fetching and using the most recent event
 */

 import { useEffect, useState } from 'react';
 import { supabase } from '../lib/supabase';

 export function useLatestEvent() {
   const [event, setEvent] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     fetchLatestEvent();
   }, []);

   const fetchLatestEvent = async () => {
     setLoading(true);
     const { data, error } = await supabase
       .from('events')
       .select('*')
       .order('created_at', { ascending: false })
       .limit(1)
       .maybeSingle();

     if (error) {
       console.error('Error fetching latest event:', error);
     } else {
       setEvent(data);
     }

     setLoading(false);
   };

   return { event, loading };
 }