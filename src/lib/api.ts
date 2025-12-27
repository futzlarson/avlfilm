// Shared API response helpers to reduce boilerplate

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

export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ error: message }, status);
}
