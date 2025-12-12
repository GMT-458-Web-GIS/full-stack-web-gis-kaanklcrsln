import { useEffect, useState } from 'react';
import { subscribeToEvents } from '../api/eventApi';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToEvents((data) => {
      setEvents(data);
      setLoading(false);
    });

    return () => unsubscribe?.();
  }, []);

  return { events, loading, error };
}
