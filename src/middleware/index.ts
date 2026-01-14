import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@/db/supabase';

const publicRoutes = ['/', '/login', '/register'];
const protectedApiRoutes = ['/api/flashcards', '/api/review', '/api/profile'];

export const onRequest = defineMiddleware(async (context, next) => {
  // Pobierz tokeny z cookies
  const accessToken = context.cookies.get('sb-access-token');
  const refreshToken = context.cookies.get('sb-refresh-token');

  // Jeśli są tokeny, spróbuj odzyskać sesję
  if (accessToken && refreshToken) {
    try {
      const supabase = createServerClient(accessToken.value);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Zapisz dane użytkownika w locals
        context.locals.user = {
          id: user.id,
          email: user.email || '',
        };
        context.locals.accessToken = accessToken.value;
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      // Wyczyść nieprawidłowe tokeny
      context.cookies.delete('sb-access-token', { path: '/' });
      context.cookies.delete('sb-refresh-token', { path: '/' });
    }
  }

  const isPublicRoute = publicRoutes.includes(context.url.pathname);
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    context.url.pathname.startsWith(route)
  );

  // Przekieruj do logowania jeśli próba dostępu do chronionej strony bez autoryzacji
  if (!isPublicRoute && !context.locals.user && !context.url.pathname.startsWith('/api/')) {
    return context.redirect('/login');
  }

  // Zwróć 401 dla nieautoryzowanych zapytań API
  if (isProtectedApiRoute && !context.locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Przekieruj do dashboardu jeśli użytkownik zalogowany próbuje dostać się do login/register
  if ((context.url.pathname === '/login' || context.url.pathname === '/register') && context.locals.user) {
    return context.redirect('/dashboard');
  }

  return next();
});



