import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

/** Chỉ người đã đăng nhập (mọi role có thể tạo khóa để chia sẻ / trao đổi) */
export default function InstructorOnly({ children }) {
  const navigate = useNavigate();
  const { user, authChecked } = useAuth();

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`, { replace: true });
      return;
    }
  }, [authChecked, user, navigate]);

  if (!authChecked || !user) return null;
  return children;
}
