const API_BASE = import.meta.env.VITE_API_URL;

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('fuel_store_token');
  
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...options.headers,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || `API Error: ${response.status}`;
    if (response.status === 401 && token) {
      localStorage.removeItem('fuel_store_user');
      localStorage.removeItem('fuel_store_token');
      window.location.href = '/login';
    }
    throw new Error(errorMsg);
  }

  return data;
}
