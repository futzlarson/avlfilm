// Internal imports
import { getAuthUser } from '@lib/auth';
import { logError } from '@lib/rollbar';
// Astro built-ins
import { defineMiddleware } from 'astro:middleware';

const PROTECTED_USER_ROUTES = ['/account/profile'];

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    // Attach user to context for use in pages
    context.locals.user = await getAuthUser(context);

    // Protect /admin routes - require admin auth
    if (context.url.pathname.startsWith('/admin')) {
      if (!context.locals.user?.isAdmin) {
        return context.redirect(
          '/account/login?redirect=' + encodeURIComponent(context.url.pathname)
        );
      }
    }

    // Protect user routes - require any auth
    if (
      PROTECTED_USER_ROUTES.some((route) =>
        context.url.pathname.startsWith(route)
      )
    ) {
      if (!context.locals.user) {
        return context.redirect(
          '/account/login?redirect=' + encodeURIComponent(context.url.pathname)
        );
      }
    }

    return next();
  } catch (error) {
    // Log unhandled errors in middleware to Rollbar
    const err = error instanceof Error ? error : new Error(String(error));
    logError(err, context.request, {
      pathname: context.url.pathname,
      middleware: 'onRequest',
    });

    // Re-throw to maintain default error handling
    throw error;
  }
});
