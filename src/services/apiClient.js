// src/services/apiClient.js
import { getToken } from '../utils/storage';

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

const REQUEST_TIMEOUT_MS = 30_000;

async function request(path, { method = 'GET', headers = {}, body, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const token = getToken();

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...authHeaders,
        ...headers,
      },
      body: body
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      const err = new Error('Máy chủ phản hồi quá chậm. Vui lòng thử lại sau.');
      err.status = 408;
      throw err;
    }
    const err = new Error('Không thể kết nối máy chủ. Kiểm tra backend đang chạy và cấu hình API.');
    err.status = 0;
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Một số API có thể trả empty body
  }

  if (!res.ok) {
    const message = data?.message || `Request failed: ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    err.response = { status: res.status, data };
    throw err;
  }

  return data;
}

export const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) =>
    request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  ensureAbsolute: (url) => {
    if (!url) return '';
    try {
      const u = new URL(url);
      return u.href;
    } catch {
      const origin = BASE_URL.replace(/\/api$/, '');
      // Support both "/uploads/a.png" and "uploads/a.png"
      if (url.startsWith('/')) return `${origin}${url}`;
      return `${origin}/${url}`;
    }
  },
};
