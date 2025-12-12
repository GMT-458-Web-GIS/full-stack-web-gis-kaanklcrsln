import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const { user, signInWithEmail, signUpWithEmail, signOut } = useAuth();

  const handleLogin = async () => {
    const email = window.prompt('Enter your email');
    const password = window.prompt('Enter your password');
    if (email && password) {
      try {
        await signInWithEmail(email, password);
      } catch (err) {
        alert('Login failed: ' + err.message);
      }
    }
  };

  const handleSignUp = async () => {
    const email = window.prompt('Enter your email');
    const password = window.prompt('Create a password (min 6 chars)');
    if (email && password) {
      try {
        await signUpWithEmail(email, password);
        alert('Account created!');
      } catch (err) {
        alert('Sign up failed: ' + err.message);
      }
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Auth</h2>
      {user ? (
        <>
          <p>Signed in as {user.email}</p>
          <Button onClick={signOut}>Sign out</Button>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={handleLogin}>Sign in</Button>
          <Button onClick={handleSignUp}>Sign up</Button>
        </div>
      )}
    </div>
  );
}
