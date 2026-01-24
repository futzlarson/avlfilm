/**
 * Validates that a URL uses http or https protocol only
 * @param url - The URL to validate
 * @returns True if URL is safe (http/https only), false otherwise
 */
export function isValidHttpUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

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

/**
 * Normalizes Instagram handle(s) to full URLs
 * Handles: @username, username, full URL, multiple space-separated handles
 * @param instagram - The Instagram handle(s) to normalize
 * @returns Array of normalized URLs
 */
export function normalizeInstagramUrls(instagram: string | null | undefined): string[] {
  if (!instagram) return [];
  const trimmed = instagram.trim();
  if (!trimmed) return [];

  // Split by spaces for multiple handles
  const handles = trimmed.split(/\s+/);

  return handles.map(handle => {
    // Already a full URL
    if (handle.startsWith('http://') || handle.startsWith('https://')) {
      return handle;
    }

    // Strip @ and build URL
    const username = handle.startsWith('@') ? handle.slice(1) : handle;
    return `https://instagram.com/${username}`;
  }).filter(url => url.length > 0);
}

/**
 * Gets display text for Instagram handles
 * @param instagram - The Instagram handle(s)
 * @returns Array of handles with @ prefix
 */
export function getInstagramDisplayText(instagram: string | null | undefined): string[] {
  if (!instagram) return [];
  const trimmed = instagram.trim();
  if (!trimmed) return [];

  const handles = trimmed.split(/\s+/);

  return handles.map(handle => {
    // Extract username from URL
    if (handle.startsWith('http://') || handle.startsWith('https://')) {
      const match = handle.match(/instagram\.com\/([^/?#]+)/);
      return match ? `@${match[1]}` : handle;
    }

    // Add @ prefix if missing
    return handle.startsWith('@') ? handle : `@${handle}`;
  });
}

/**
 * Normalizes YouTube URL or handle
 * Handles: @channel, youtube.com/..., youtu.be/...
 * @param youtube - The YouTube URL or handle to normalize
 * @returns The normalized YouTube URL
 */
export function normalizeYoutubeUrl(youtube: string | null | undefined): string {
  if (!youtube) return '';
  const trimmed = youtube.trim();
  if (!trimmed) return '';

  // Already has protocol
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Handle @username format
  if (trimmed.startsWith('@')) {
    return `https://youtube.com/${trimmed}`;
  }

  // Plain username - assume needs @
  return `https://youtube.com/@${trimmed}`;
}

