// Database types generated from Supabase schema for 10xCards
// This file should be regenerated after schema changes using:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/db/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          default_ai_level: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          default_ai_level?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          default_ai_level?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          front: string;
          back: string;
          part_of_speech: string | null;
          ai_generated: boolean;
          flashcard_language_level: LanguageLevel | null;
          leitner_box: number;
          review_due_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          front: string;
          back: string;
          part_of_speech?: string | null;
          ai_generated?: boolean;
          flashcard_language_level?: LanguageLevel | null;
          leitner_box?: number;
          review_due_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          front?: string;
          back?: string;
          part_of_speech?: string | null;
          ai_generated?: boolean;
          flashcard_language_level?: LanguageLevel | null;
          leitner_box?: number;
          review_due_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_generation_logs: {
        Row: {
          id: string;
          user_id: string;
          generated_count: number;
          imported_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          generated_count: number;
          imported_count: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          generated_count?: number;
          imported_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_flashcard_review: {
        Args: {
          p_flashcard_id: string;
          p_knew_it: boolean;
        };
        Returns: void;
      };
    };
    Enums: {
      language_level: LanguageLevel;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];


