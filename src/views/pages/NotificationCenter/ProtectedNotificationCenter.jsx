import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import NotificationCenter from './NotificationCenter';

export default function ProtectedNotificationCenter() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <NotificationCenter />;
}
