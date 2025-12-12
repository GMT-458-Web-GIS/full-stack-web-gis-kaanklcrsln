import { rtdb } from '../config/firebase.js';

const profilesRef = rtdb.ref('profiles');

export async function getUserById(id) {
  const snapshot = await profilesRef.child(id).get();
  if (!snapshot.exists()) throw new Error('User not found');
  return { id, ...snapshot.val() };
}

export async function updateUserProfile(id, payload) {
  await profilesRef.child(id).set(payload, { merge: true });
  const snapshot = await profilesRef.child(id).get();
  return { id, ...snapshot.val() };
}
