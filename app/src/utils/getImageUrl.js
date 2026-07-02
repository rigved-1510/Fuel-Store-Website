export function getImageUrl(path) {
  if (!path) return '';
  // If it's already an absolute URL (http, https, data URI), return as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // Remove leading slash if present to prevent double slashes (e.g. localhost:5000//uploads/...)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `http://localhost:5000/${cleanPath}`;
}
