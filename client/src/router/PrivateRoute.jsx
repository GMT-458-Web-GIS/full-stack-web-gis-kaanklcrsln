import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: 'var(--color-text-secondary)'
      }}>
        Yükleniyor...
      </div>
    );
  }

  // Eğer user yoksa login sayfasına yönlendir
  if (!user) {
    return <Navigate to="/giris" state={{ from: location }} replace />;
  }

  return children;
}
