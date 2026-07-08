import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  saveSession,
  setAdminViewMode,
  getToken,
  getUser,
  removeAdminViewMode,
} from '../../../utils/storage';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../services/apiClient';
import AdminRoleChoice from '../../components/auth/AdminRoleChoice/AdminRoleChoice';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import styles from './AuthCallback.module.css';

const OAUTH_STORAGE = {
  code: 'oauth_exchange_code',
  state: 'oauth_exchange_state',
  pendingAdminChoice: 'oauth_pending_admin_choice',
};

function clearOAuthStorage() {
  sessionStorage.removeItem(OAUTH_STORAGE.code);
  sessionStorage.removeItem(OAUTH_STORAGE.state);
  sessionStorage.removeItem(OAUTH_STORAGE.pendingAdminChoice);
}

function PageShell({ children }) {
  return (
    <>
      <Header />
      <div className={styles.wrapper}>
        <div className={styles.card}>{children}</div>
      </div>
      <Footer />
    </>
  );
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const exchangeStarted = useRef(false);
  const [showRoleChoice, setShowRoleChoice] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    const urlState = params.get('state') || '';

    if (urlCode) {
      sessionStorage.setItem(OAUTH_STORAGE.code, urlCode);
      if (urlState) sessionStorage.setItem(OAUTH_STORAGE.state, urlState);
      window.history.replaceState({}, '', '/auth/callback');
    }

    const code = urlCode || sessionStorage.getItem(OAUTH_STORAGE.code);
    const state = urlState || sessionStorage.getItem(OAUTH_STORAGE.state) || '';

    const finishLogin = (user, flowState) => {
      removeAdminViewMode();

      if (user?.role === 'admin') {
        sessionStorage.setItem(OAUTH_STORAGE.pendingAdminChoice, '1');
        setShowRoleChoice(true);
        return;
      }

      clearOAuthStorage();

      if (flowState === 'register') {
        navigate('/courses', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    };

    if (!code && sessionStorage.getItem(OAUTH_STORAGE.pendingAdminChoice) === '1') {
      const user = getUser();
      const token = getToken();
      if (token && user?.role === 'admin') {
        setShowRoleChoice(true);
        checkAuthStatus();
      } else {
        clearOAuthStorage();
        navigate('/login', { replace: true });
      }
      return;
    }

    if (!code) {
      navigate('/login', { replace: true });
      return;
    }

    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    (async () => {
      try {
        const data = await apiClient.post('/auth/oauth/exchange', { code });

        const { token, user } = data;
        if (!token || !user) {
          throw new Error('Invalid session');
        }

        sessionStorage.removeItem(OAUTH_STORAGE.code);

        saveSession({ token, user });
        checkAuthStatus();

        const flowState = data.state || state;
        finishLogin(user, flowState);
      } catch (e) {
        console.error('Auth callback exchange error', e);
        clearOAuthStorage();
        const msg = encodeURIComponent(
          e?.message || 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.',
        );
        navigate(`/login?error=oauth&message=${msg}`, { replace: true });
      }
    })();
  }, [navigate, checkAuthStatus]);

  const continueAsCustomer = () => {
    clearOAuthStorage();
    setAdminViewMode('customer');
    navigate('/', { replace: true });
  };

  const continueAsAdmin = () => {
    clearOAuthStorage();
    setAdminViewMode('admin');
    navigate('/admin', { replace: true });
  };

  if (showRoleChoice) {
    return (
      <PageShell>
        <h1 className={styles.title}>Đăng nhập thành công</h1>
        <AdminRoleChoice
          onContinueAsCustomer={continueAsCustomer}
          onContinueAsAdmin={continueAsAdmin}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className={styles.loading}>
        <h2>Đang xử lý đăng nhập...</h2>
        <p>Vui lòng đợi trong giây lát.</p>
      </div>
    </PageShell>
  );
}
