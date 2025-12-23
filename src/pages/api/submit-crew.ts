import type { APIRoute } from 'astro';

// TODO: Insert filmmaker submission into database
export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
