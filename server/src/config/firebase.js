import admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!serviceAccount) {
  console.warn('Firebase service account key is missing. Check your environment variables.');
}

admin.initializeApp({
  credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
  databaseURL: 'https://friendly-2fb02-default-rtdb.europe-west1.firebasedatabase.app'
});

export const firebaseAdmin = admin;
export const rtdb = admin.database();
export const auth = admin.auth();
