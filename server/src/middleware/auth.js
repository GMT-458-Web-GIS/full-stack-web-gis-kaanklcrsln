import { auth } from '../config/firebase.js';

export async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = { id: decodedToken.uid, email: decodedToken.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
