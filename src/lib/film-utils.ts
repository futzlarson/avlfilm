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
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format a runtime, rounded UP to the next whole minute, as a compact
 * string like "1h20m", "2h", or "45m". Used for the schedule runtime total.
 */
export function formatRuntime(totalSeconds: number): string {
  const totalMinutes = Math.ceil(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return minutes > 0 ? `${hours}h${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Calculate total runtime for an array of submissions (in seconds)
 */
export function calculateTotalRuntime(subs: Pick<Submission, 'filmLength'>[]): number {
  return subs.reduce((sum, sub) => sum + sub.filmLength, 0);
}
