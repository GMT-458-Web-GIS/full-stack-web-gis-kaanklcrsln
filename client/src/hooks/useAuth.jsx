import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../api/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  const signInWithEmail = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpWithEmail = useCallback(async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    navigate('/giris');
  }, [navigate]);

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
    navigate('/giris');
  }, [navigate]);

  return { user, loading, signInWithEmail, signUpWithEmail, signOut, logout };
}

