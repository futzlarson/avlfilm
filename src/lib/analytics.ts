/**
 * Custom analytics tracking function
 * Logs events to our own database instead of third-party services
 * Won't be blocked by ad-blockers, provides full data ownership
 *
 * In development mode, logs to console instead of sending to API
 */

export function track(eventName: string, properties?: Record<string, any>): void {
  const isDev = import.meta.env.DEV;

  if (isDev) {
    // Log to console in development instead of sending to API
    console.log('[Analytics]', eventName, properties || {});
    return;
  }

  // Fire and forget - don't block UI
  fetch('/api/track-event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventName,
      properties,
    }),
  }).catch(error => {
    // Silently fail - analytics shouldn't break user experience
    console.error('Analytics tracking failed:', error);
  });
}
