import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSession, setAdminViewMode } from '../../../utils/storage';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../services/apiClient';
import AdminRoleChoice from '../../components/auth/AdminRoleChoice/AdminRoleChoice';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const exchangeStarted = useRef(false);
  const [showRoleChoice, setShowRoleChoice] = useState(false);

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
          setShowRoleChoice(true);
          return;
        }

        if (flowState === 'register') {
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

  const continueAsCustomer = () => {
    setAdminViewMode('customer');
    navigate('/', { replace: true });
  };

  const continueAsAdmin = () => {
    setAdminViewMode('admin');
    navigate('/admin', { replace: true });
  };

  if (showRoleChoice) {
    return (
      <div style={{ padding: 24, maxWidth: 560, margin: '80px auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng nhập thành công</h2>
        <AdminRoleChoice
          onContinueAsCustomer={continueAsCustomer}
          onContinueAsAdmin={continueAsAdmin}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h2>Đang xử lý đăng nhập...</h2>
      <p>Vui lòng đợi trong giây lát.</p>
    </div>
  );
}
