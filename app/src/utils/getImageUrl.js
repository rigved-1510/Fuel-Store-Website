const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

export function getImageUrl(path) {
  if (!path) return '';

  // Already a full URL
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${API_BASE}/${cleanPath}`;
}