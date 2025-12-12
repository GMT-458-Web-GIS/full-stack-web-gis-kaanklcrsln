import { rtdb } from './firebase';
import { ref, get, set, push, query as rtQuery, orderByChild, onValue } from 'firebase/database';

const eventsRef = ref(rtdb, 'events');

export async function fetchEvents() {
  const snapshot = await get(eventsRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data)
    .map((key) => ({ id: key, ...data[key] }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function createEvent(eventPayload) {
  const newEventRef = push(eventsRef);
  await set(newEventRef, { ...eventPayload, createdAt: new Date().toISOString() });
  return { id: newEventRef.key, ...eventPayload };
}

export async function fetchEventById(id) {
  const eventRef = ref(rtdb, `events/${id}`);
  const snapshot = await get(eventRef);
  if (!snapshot.exists()) throw new Error('Event not found');
  return { id, ...snapshot.val() };
}

export function subscribeToEvents(callback) {
  return onValue(eventsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const events = Object.keys(data)
      .map((key) => ({ id: key, ...data[key] }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(events);
  });
}
