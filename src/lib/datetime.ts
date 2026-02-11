/**
 * Common date format presets for toLocaleDateString
 */
export const DATE_SHORT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
export const DATE_LONG: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
export const DATE_LONG_NO_YEAR: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };

/** Formats a Date using a preset, defaults to DATE_SHORT */
export function formatDate(date: Date, format: Intl.DateTimeFormatOptions = DATE_SHORT): string {
  return date.toLocaleDateString('en-US', format);
}

/**
 * Converts a Date to datetime-local input format (YYYY-MM-DDTHH:MM)
 * Adjusts for timezone offset to display local time
 */
export function toDatetimeLocal(date?: Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/**
 * Subtracts days from a date and returns datetime-local format
 * Useful for calculating deadlines relative to event dates
 */
export function subtractDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
  return result.toISOString().slice(0, 16);
}
