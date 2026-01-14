// Database types generated from Supabase schema
// This file should be regenerated after schema changes using:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/db/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          front: string;
          back: string;
          part_of_speech: string | null;
          leitner_box: number;
          review_due_at: string;
          ai_generated: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          front: string;
          back: string;
          part_of_speech?: string | null;
          leitner_box?: number;
          review_due_at?: string;
          ai_generated?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          front?: string;
          back?: string;
          part_of_speech?: string | null;
          leitner_box?: number;
          review_due_at?: string;
          ai_generated?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

