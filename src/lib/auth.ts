/**
 * Checks if request has HTTP Basic Auth credentials
 * Vercel deployment protection handles actual validation
 * Returns true if Authorization header is present
 */
export function isAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader !== null && authHeader.startsWith('Basic ');
}

/**
 * Returns a 401 Unauthorized response for failed authentication
 */
export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    }
  );
}
