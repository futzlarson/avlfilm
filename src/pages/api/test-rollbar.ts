import type { APIRoute } from 'astro';
import { logError, logWarning, logInfo } from '../../lib/rollbar';
import { jsonResponse } from '../../lib/api';

/**
 * Test endpoint for Rollbar integration
 * GET /api/test-rollbar?type=error|warning|info|exception
 */
export const GET: APIRoute = async ({ request, url }) => {
  const type = url.searchParams.get('type') || 'error';

  switch (type) {
    case 'error':
      logError(
        new Error('Test error from Rollbar test endpoint'),
        request,
        {
          testType: 'manual error',
          timestamp: new Date().toISOString(),
        }
      );
      return jsonResponse({
        success: true,
        message: 'Test error logged to Rollbar',
        type: 'error',
      });

    case 'warning':
      logWarning('Test warning from Rollbar test endpoint', {
        testType: 'manual warning',
        timestamp: new Date().toISOString(),
      });
      return jsonResponse({
        success: true,
        message: 'Test warning logged to Rollbar',
        type: 'warning',
      });

    case 'info':
      logInfo('Test info message from Rollbar test endpoint', {
        testType: 'manual info',
        timestamp: new Date().toISOString(),
      });
      return jsonResponse({
        success: true,
        message: 'Test info logged to Rollbar',
        type: 'info',
      });

    case 'exception':
      // Simulate an actual exception
      try {
        throw new Error('Test exception for Rollbar');
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logError(err, request, {
          testType: 'caught exception',
          timestamp: new Date().toISOString(),
        });
        return jsonResponse({
          success: true,
          message: 'Test exception caught and logged to Rollbar',
          type: 'exception',
        });
      }

    default:
      return jsonResponse({
        error: 'Invalid type parameter. Use: error, warning, info, or exception',
      }, 400);
  }
};
