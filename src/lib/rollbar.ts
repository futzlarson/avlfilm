import Rollbar from 'rollbar';

/**
 * Server-side Rollbar instance
 * Used in API routes, middleware, and server-side code
 */
export const rollbar = new Rollbar({
  accessToken: import.meta.env.ROLLBAR_ACCESS_TOKEN,
  environment: import.meta.env.MODE || 'development',
  captureUncaught: true,
  captureUnhandledRejections: true,

  // Enable in production, disable in development to avoid noise
  enabled: import.meta.env.MODE === 'production',

  // Code version for tracking deploys
  codeVersion: import.meta.env.PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,

  // Additional context
  payload: {
    environment: import.meta.env.MODE || 'development',
    server: {
      root: 'webpack:///./',
      branch: import.meta.env.PUBLIC_VERCEL_GIT_COMMIT_REF || undefined,
    },
  },
});

/**
 * Log an error to Rollbar with optional context
 */
export function logError(
  error: Error | string | unknown,
  requestOrData?: Request | Record<string, unknown>,
  customData?: Record<string, unknown>
) {
  // Always log to console
  console.error(error);

  if (!rollbar.options.enabled) {
    return;
  }

  // Auto-detect if second param is Request or custom data
  let request: Request | undefined;
  let data: Record<string, unknown> = {};

  if (requestOrData instanceof Request) {
    request = requestOrData;
    data = { ...customData };
  } else if (requestOrData) {
    // Second param is custom data
    data = { ...requestOrData };
  }

  // Add request context if available
  if (request) {
    data.request = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    };
  }

  // Convert any error type to Error object
  let errorObj: Error | string;
  if (typeof error === 'string') {
    errorObj = error;
  } else if (error instanceof Error) {
    errorObj = error;
  } else {
    errorObj = new Error(String(error));
  }

  rollbar.error(errorObj, data);
}

/**
 * Log a warning to Rollbar
 */
export function logWarning(message: string, customData?: Record<string, unknown>) {
  // Always log to console
  console.warn(message);

  if (!rollbar.options.enabled) {
    return;
  }

  rollbar.warning(message, customData);
}

/**
 * Log an info message to Rollbar
 */
export function logInfo(message: string, customData?: Record<string, unknown>) {
  // Always log to console
  console.info(message);

  if (!rollbar.options.enabled) {
    return;
  }

  rollbar.info(message, customData);
}
