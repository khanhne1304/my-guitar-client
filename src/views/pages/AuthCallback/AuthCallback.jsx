import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSession } from '../../../utils/storage';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../services/apiClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const exchangeStarted = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code) {
      navigate('/login', { replace: true });
      return;
    }

    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    // Xóa code khỏi URL ngay để tránh exchange trùng khi component remount
    const cleanUrl = state
      ? `/auth/callback?state=${encodeURIComponent(state)}`
      : '/auth/callback';
    window.history.replaceState({}, '', cleanUrl);

    (async () => {
      try {
        const data = await apiClient.post('/auth/oauth/exchange', { code });

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
        console.error('Auth callback exchange error', e);
        const msg = encodeURIComponent(
          e?.message || 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.',
        );
        navigate(`/login?error=oauth&message=${msg}`, { replace: true });
      }
    })();
  }, [navigate, checkAuthStatus]);

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h2>Đang xử lý đăng nhập...</h2>
      <p>Vui lòng đợi trong giây lát.</p>
    </div>
  );
}
