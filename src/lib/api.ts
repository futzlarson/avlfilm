// Shared API response helpers to reduce boilerplate
import { logError, logWarning } from './rollbar';

export function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function successResponse(data?: unknown): Response {
  return jsonResponse(data || { success: true }, 200);
}

export function errorResponse(
  message: string,
  ...args: (number | Error | unknown | Request | boolean)[]
): Response {
  // Auto-detect parameters from any position
  let status: number | undefined;
  let error: Error | unknown | undefined;
  let request: Request | undefined;
  let shouldForceLog = false;

  // Scan through arguments and extract by type
  for (const arg of args) {
    if (typeof arg === 'number') {
      status = arg;
    } else if (typeof arg === 'boolean') {
      shouldForceLog = arg;
    } else if (arg instanceof Request) {
      request = arg;
    } else if (arg) {
      // Assume it's an error
      error = arg;
    }
  }

  // Auto-detect status from error if not explicitly provided
  if (!status) {
    status = 500; // default
    if (error && typeof error === 'object') {
      if ('status' in error && typeof error.status === 'number') {
        status = error.status;
      } else if ('statusCode' in error && typeof error.statusCode === 'number') {
        status = error.statusCode;
      }
    }
  }

  // Generate console.error() message
  console.error(message, error);

  const shouldLog = shouldForceLog || status >= 500;

  if (shouldLog && error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const metadata = { errorMessage: message, statusCode: status };

    // Log 5xx as errors, 4xx as warnings
    if (status >= 500) {
      logError(errorObj, request, metadata);
    } else {
      logWarning(`${status} Error: ${message}`, {
        ...metadata,
        error: errorObj.message,
        stack: errorObj.stack,
        url: request?.url,
        method: request?.method,
      });
    }
  }

  return jsonResponse({ error: message }, status);
}
