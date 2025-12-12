import { rtdb } from '../config/firebase.js';

const eventsRef = rtdb.ref('events');

export async function getAllEvents() {
  const snapshot = await eventsRef.get();
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data)
    .map((key) => ({ id: key, ...data[key] }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getEventById(id) {
  const snapshot = await rtdb.ref(`events/${id}`).get();
  if (!snapshot.exists()) throw new Error('Event not found');
  return { id, ...snapshot.val() };
}

export async function getNearbyEvents(lat, lng, radiusMeters = 10000) {
  // Note: Realtime Database does not natively support geo-queries.
  // For geo filtering, consider using geohash libraries (e.g., geofire-common).
  // This returns all events.
  const snapshot = await eventsRef.get();
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
}

export async function createEvent(payload) {
  const newRef = eventsRef.push();
  await newRef.set({ ...payload, createdAt: new Date().toISOString() });
  return { id: newRef.key, ...payload };
}
