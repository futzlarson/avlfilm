import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Only protect /admin routes
  if (context.url.pathname.startsWith('/admin')) {
    const authHeader = context.request.headers.get('authorization');

    if (!authHeader) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      });
    }

    // Parse Basic Auth header
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(':');

    // Check against environment variable
    const adminPassword = import.meta.env.ADMIN_PASSWORD || 'admin';

    if (password !== adminPassword) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      });
    }
  }

  return next();
});
