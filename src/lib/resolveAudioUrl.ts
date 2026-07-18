function encodePathSegment(segment: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(segment))
  } catch {
    return encodeURIComponent(segment)
  }
}

/**
 * Resolves a stored audio path for fetch/play in dev and production deployments
 * (including GitHub Pages subpath bases) and encodes path segments for filenames
 * with spaces or special characters.
 */
export function resolveAudioUrl(url: string): string {
  if (
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    /^https?:\/\//i.test(url)
  ) {
    return url
  }

  const base = import.meta.env.BASE_URL
  const basePath = base.endsWith('/') ? base.slice(0, -1) : base

  let pathname = url.startsWith('/') ? url : `/${url}`
  if (basePath && !pathname.startsWith(basePath)) {
    pathname = `${basePath}${pathname}`
  }

  return pathname
    .split('/')
    .map((segment) => (segment === '' ? '' : encodePathSegment(segment)))
    .join('/')
}
