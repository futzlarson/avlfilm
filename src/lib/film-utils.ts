import type { Submission } from '@db/schema';

/**
 * Parse HH:MM:SS or MM:SS string to total seconds
 */
export function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 2) {
    // MM:SS format
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // HH:MM:SS format
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

/**
 * Format total seconds to HH:MM:SS string
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate total runtime for an array of submissions (in seconds)
 */
export function calculateTotalRuntime(subs: Pick<Submission, 'filmLength'>[]): number {
  return subs.reduce((sum, sub) => sum + sub.filmLength, 0);
}
