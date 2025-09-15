// src/services/apiClient.js
const BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

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
      if (url.startsWith('/')) return `${BASE_URL.replace(/\/api$/, '')}${url}`;
      return url;
    }
  },
};
