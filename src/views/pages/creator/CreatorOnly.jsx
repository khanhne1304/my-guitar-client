import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function CreatorOnly({ children }) {
  const navigate = useNavigate();
  const { user, authChecked } = useAuth();

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`, { replace: true });
    }
  }, [authChecked, user, navigate]);

  if (!authChecked || !user) return null;
  return children;
}
