export function assetUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (/^(https?:|data:|blob:|\/\/)/i.test(path)) return path;

  const rawBase = import.meta.env.BASE_URL || './';
  const base = rawBase === '/' ? '' : rawBase.replace(/\/+$/, '');

  const cleanPath = path.replace(/^(\.\/|\/)+/, '');

  if (base && base !== '.') {
    const cleanBase = base.replace(/^\/+/, '');
    if (cleanBase && cleanPath.startsWith(`${cleanBase}/`)) {
      return `/${cleanPath}`;
    }
    return `${base}/${cleanPath}`;
  }

  return `./${cleanPath}`;
}
