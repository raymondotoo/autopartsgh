const API_URL = import.meta.env.VITE_API_URL;

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

export async function initializePayment(payload) {
  const data = await apiFetch('/api/payments/initialize', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data;
}
