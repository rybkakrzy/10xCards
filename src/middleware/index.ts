import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@/db/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register'];

  const isPublicRoute = publicRoutes.some((route) => context.url.pathname === route);

  // Get access token from cookies
  const accessToken = context.cookies.get('sb-access-token')?.value;

  if (accessToken) {
    // Verify token with Supabase
    const supabase = createServerClient(accessToken);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      // Store user in locals for use in API routes and pages
      context.locals.user = {
        id: user.id,
        email: user.email || '',
      };
      context.locals.accessToken = accessToken;
    }
  }

  // Redirect to login if accessing protected route without auth
  if (!isPublicRoute && !context.locals.user) {
    return context.redirect('/login');
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if ((context.url.pathname === '/login' || context.url.pathname === '/register') && context.locals.user) {
    return context.redirect('/dashboard');
  }

  return next();
});

