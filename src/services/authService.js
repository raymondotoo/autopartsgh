const AUTH_KEY = 'agh_auth_v1';
const API_URL = import.meta.env.VITE_API_URL;

function loadAuth() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAuth(data) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

async function apiFetch(path, options = {}) {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    if (!res.ok) throw new Error('API request failed');
    return res.json();
  } catch {
    return null;
  }
}

export function getAuth() {
  return loadAuth();
}

export async function login(credentials) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  if (!data) return null;
  saveAuth(data);
  return data;
}

export async function register(payload) {
  const data = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (!data) return null;
  saveAuth(data);
  return data;
}

export function logout() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_KEY);
}
