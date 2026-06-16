import { useState, useEffect } from 'react';

export function useOffChainStats() {
  const [stats, setStats] = useState({ messagesCount: 0, votesCount: 0 });
  const [loading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setStats((prev) => ({
        messagesCount: prev.messagesCount + Math.floor(Math.random() * 3),
        votesCount: prev.votesCount + Math.floor(Math.random() * 2),
      }));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return { stats, loading };
}
