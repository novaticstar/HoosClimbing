import { useEffect, useState } from 'react';
import { FeedService, FeedItem } from '../services/feedService';

export function useTopPost() {
  const [post, setPost] = useState<FeedItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTopPost = async () => {
    const data = await FeedService.getTopPost();
    setPost(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTopPost();
  }, []);

  return { post, loading, refresh: fetchTopPost };
}