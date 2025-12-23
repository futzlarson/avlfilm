import type { APIRoute } from 'astro';

// TODO: Query all filmmakers from database
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify([]),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
