import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  // Clear session cookies
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });

  return new Response(
    JSON.stringify({ message: 'Logged out successfully' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

