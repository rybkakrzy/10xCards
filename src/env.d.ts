/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db/database.types';

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly OPENROUTER_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user?: {
      id: string;
      email: string;
    };
    accessToken?: string;
    supabase?: SupabaseClient<Database>;
    session?: {
      user: {
        id: string;
        email?: string;
      };
      access_token: string;
      refresh_token: string;
    };
  }
}



