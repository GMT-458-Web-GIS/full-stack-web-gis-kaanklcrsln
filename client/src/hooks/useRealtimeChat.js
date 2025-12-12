import { useEffect, useState } from 'react';
import { subscribeToMessages } from '../api/chatApi';

export function useRealtimeChat(roomId) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!roomId) return undefined;

    const unsubscribe = subscribeToMessages(roomId, setMessages);

    return () => unsubscribe();
  }, [roomId]);

  return { messages };
}
