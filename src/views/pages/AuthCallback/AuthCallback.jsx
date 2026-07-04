import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSession } from '../../../utils/storage';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../services/apiClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code) {
      navigate('/login', { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await apiClient.post('/auth/oauth/exchange', { code });
        if (cancelled) return;

        const { token, user } = data;
        if (!token || !user) {
          throw new Error('Invalid session');
        }

        saveSession({ token, user });
        checkAuthStatus();

        const flowState = data.state || state;
        if (user?.role === 'admin' && flowState !== 'register') {
          navigate('/admin', { replace: true });
        } else if (flowState === 'register') {
          navigate('/courses', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (e) {
        if (cancelled) return;
        console.error('Auth callback exchange error', e);
        navigate('/login', { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, checkAuthStatus]);

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h2>Đang xử lý đăng nhập...</h2>
      <p>Vui lòng đợi trong giây lát.</p>
    </div>
  );
}
