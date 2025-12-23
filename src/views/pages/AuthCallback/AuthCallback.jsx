import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSession } from '../../../utils/storage';
import { useAuth } from '../../../context/AuthContext';

export default function AuthCallback() {
	const navigate = useNavigate();
	const { checkAuthStatus } = useAuth();

	useEffect(() => {
		try {
			const params = new URLSearchParams(window.location.search);
			const tokenParam = params.get('token');
			const userParam = params.get('user');
			const state = params.get('state'); // 'register' nếu flow bắt đầu từ trang đăng ký
			if (tokenParam && userParam) {
				const token = decodeURIComponent(tokenParam);
				const userJson = atob(decodeURIComponent(userParam));
				const user = JSON.parse(userJson);
				saveSession({ token, user });
				checkAuthStatus();
				// Điều hướng theo flow:
				if (user?.role === 'admin' && state !== 'register') {
					navigate('/admin', { replace: true });
				} else {
					// Nếu bắt đầu từ đăng ký → tới trang cập nhật; nếu không → về trang chủ
					if (state === 'register') {
						navigate('/account/edit?returnTo=/', { replace: true });
					} else {
						navigate('/', { replace: true });
					}
				}
				return;
			}
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error('Auth callback parse error', e);
		}
		// fallback về trang đăng nhập nếu không có dữ liệu
		navigate('/login', { replace: true });
	}, [navigate, checkAuthStatus]);

	return (
		<div style={{ padding: 24, textAlign: 'center' }}>
			<h2>Đang xử lý đăng nhập...</h2>
			<p>Vui lòng đợi trong giây lát.</p>
		</div>
	);
}

