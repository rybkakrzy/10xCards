import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Astro handles import.meta.env natively
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required: SUPABASE_URL and SUPABASE_KEY'
  );
}

// Walidacja URL
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  throw new Error(
    `Invalid SUPABASE_URL: "${supabaseUrl}"\n` +
    'URL must start with http:// or https://\n' +
    'Example: https://your-project.supabase.co'
  );
}

// Client for server-side operations (Astro API routes)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper to create a client with a specific session (for authenticated requests)
export function createServerClient(accessToken?: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  });
}

