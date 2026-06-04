/**
 * Resolves backend base URL for production and local dev.
 * Priority: runtime config.js → Vite env → localhost
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.__API_URL__) {
    return window.__API_URL__.replace(/\/$/, '');
  }

  const viteUrl = import.meta.env.VITE_API_URL;
  if (viteUrl && viteUrl.trim() && !viteUrl.includes('localhost')) {
    return viteUrl.replace(/\/$/, '');
  }

  return (viteUrl || 'http://localhost:8000').replace(/\/$/, '');
}
