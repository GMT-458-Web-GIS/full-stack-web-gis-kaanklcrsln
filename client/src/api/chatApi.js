import { rtdb } from './firebase';
import { ref, get, push, set, onValue } from 'firebase/database';

const roomsRef = ref(rtdb, 'rooms');

export async function fetchRooms() {
  const snapshot = await get(roomsRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
}

export async function fetchMessages(roomId) {
  const messagesRef = ref(rtdb, `rooms/${roomId}/messages`);
  const snapshot = await get(messagesRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data)
    .map((key) => ({ id: key, ...data[key] }))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export async function sendMessage({ roomId, userId, content }) {
  const messagesRef = ref(rtdb, `rooms/${roomId}/messages`);
  const newMsgRef = push(messagesRef);
  await set(newMsgRef, { userId, content, createdAt: new Date().toISOString() });
  return { id: newMsgRef.key, userId, content };
}

export function subscribeToMessages(roomId, callback) {
  const messagesRef = ref(rtdb, `rooms/${roomId}/messages`);
  return onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const messages = Object.keys(data)
      .map((key) => ({ id: key, ...data[key] }))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    callback(messages);
  });
}
