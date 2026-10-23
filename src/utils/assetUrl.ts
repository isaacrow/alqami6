export function assetUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (/^(https?:|data:|blob:|\/\/)/i.test(path)) return path;

  const rawBase = import.meta.env.BASE_URL || '/';
  const base = rawBase.replace(/\/+$/, '');

  // If path already starts with base (e.g. "/ALQAMI5/models/..."), return it directly
  if (base && (path === base || path.startsWith(`${base}/`))) {
    return path;
  }

  const cleanPath = path.replace(/^\/+/, '');
  const cleanBase = base.replace(/^\/+/, '');
  if (cleanBase && cleanPath.startsWith(`${cleanBase}/`)) {
    return `/${cleanPath}`;
  }

  return base ? `${base}/${cleanPath}` : `/${cleanPath}`;
}
