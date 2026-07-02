const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || '';

export function getProductImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath; // External URL
  return `${IMAGE_BASE_URL}/${imagePath}`;
}
