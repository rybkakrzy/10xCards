// Client-side Supabase client for React components
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Astro handles import.meta.env natively
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing public Supabase environment variables. Please check your .env file.\n' +
    'Required: PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Walidacja URL
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  throw new Error(
    `Invalid PUBLIC_SUPABASE_URL: "${supabaseUrl}"\n` +
    'URL must start with http:// or https://\n' +
    'Example: https://your-project.supabase.co'
  );
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

