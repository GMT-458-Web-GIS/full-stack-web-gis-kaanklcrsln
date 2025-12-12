import { rtdb } from '../config/firebase.js';

export async function getMessagesByRoom(roomId) {
  const snapshot = await rtdb.ref(`rooms/${roomId}/messages`).get();
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data)
    .map((key) => ({ id: key, ...data[key] }))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export async function createMessage({ roomId, userId, content }) {
  const messagesRef = rtdb.ref(`rooms/${roomId}/messages`);
  const newMsgRef = messagesRef.push();
  await newMsgRef.set({ userId, content, createdAt: new Date().toISOString() });
  return { id: newMsgRef.key, userId, content };
}
