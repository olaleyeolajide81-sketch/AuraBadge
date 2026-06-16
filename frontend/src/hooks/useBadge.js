import { useState, useEffect, useCallback } from 'react';
import { getBadge } from '../contract';

export function useBadge(publicKey) {
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getBadge(publicKey);
      setBadge(result.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { badge, loading, error, refetch: fetch };
}
