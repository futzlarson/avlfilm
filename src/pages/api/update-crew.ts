import type { APIRoute } from 'astro';

// TODO: Update filmmaker approval status in database
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
