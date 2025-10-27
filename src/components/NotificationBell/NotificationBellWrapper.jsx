import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function NotificationBellWrapper() {
  const { isAuthenticated } = useAuth();

  // Chỉ hiển thị NotificationBell khi user đã đăng nhập
  if (!isAuthenticated) {
    return null;
  }

  return <NotificationBell />;
}
