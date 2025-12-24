/**
 * Normalizes a URL to ensure it starts with https://
 * @param url - The URL to normalize
 * @returns The normalized URL with https:// prefix
 */
export function normalizeUrl(url: string | null | undefined): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already has a protocol
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Add https:// prefix
  return `https://${trimmed}`;
}
