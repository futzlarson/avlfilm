/**
 * Custom analytics tracking function
 * Logs events to our own database instead of third-party services
 * Won't be blocked by ad-blockers, provides full data ownership
 *
 * In development mode, logs to console instead of sending to API
 */

import { nanoid } from 'nanoid';

import { logWarning } from './rollbar';

function getOrCreateVisitorId(): string {
  const key = 'analytics_visitor_id';
  let visitorId = localStorage.getItem(key);

  if (!visitorId) {
    visitorId = nanoid(10); // 10 character ID (e.g., "V1StGXR8_Z")
    localStorage.setItem(key, visitorId);
  }

  return visitorId;
}

function getTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

export function track(eventName: string, properties?: Record<string, unknown>): void {
  const isDev = import.meta.env.DEV;
  const visitorId = getOrCreateVisitorId();
  const timezone = getTimezone();

  if (isDev) {
    // Log to console in development instead of sending to API
    console.log('[Analytics]', eventName, {
      ...properties,
      visitorId,
      timezone,
    });
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
      visitorId,
      timezone,
    }),
  }).catch(error => {
    // Silently fail - analytics shouldn't break user experience
    // Log as warning since this isn't critical
    logWarning('Analytics tracking failed', { error, service: 'analytics' });
  });
}
