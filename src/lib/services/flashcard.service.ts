import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TablesInsert, TablesUpdate } from '@/db/database.types';
import type { Flashcard, CreateFlashcardRequest, UpdateFlashcardRequest } from '@/types';

export type GetFlashcardsOptions = {
  page: number;
  pageSize: number;
  sortBy: 'created_at' | 'front' | 'leitner_box';
  order: 'asc' | 'desc';
};

export type PaginatedFlashcardsResponse = {
  data: Flashcard[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export class FlashcardService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Pobiera listę fiszek użytkownika z paginacją i sortowaniem.
   */
  async getFlashcards(
    userId: string,
    options: GetFlashcardsOptions
  ): Promise<PaginatedFlashcardsResponse> {
    const { page, pageSize, sortBy, order } = options;
    const offset = (page - 1) * pageSize;

    // Policz wszystkie fiszki użytkownika
    const { count, error: countError } = await this.supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting flashcards:', countError);
      throw new Error('Failed to count flashcards.');
    }

    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Pobierz fiszki z paginacją
    const { data: flashcards, error } = await this.supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .order(sortBy, { ascending: order === 'asc' })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching flashcards:', error);
      throw new Error('Failed to fetch flashcards.');
    }

    return {
      data: flashcards as Flashcard[],
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * Tworzy nową fiszkę.
   */
  async createFlashcard(
    userId: string,
    data: CreateFlashcardRequest
  ): Promise<Flashcard> {
    const { front, back, part_of_speech, ai_generated } = data;

    const insertData = {
      user_id: userId,
      front: front.trim(),
      back: back.trim(),
      part_of_speech: part_of_speech || null,
      ai_generated: ai_generated || false,
      leitner_box: 1,
      review_due_at: new Date().toISOString(),
    } as TablesInsert<'flashcards'>;

    const { data: newFlashcard, error } = await this.supabase
      .from('flashcards')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating flashcard:', error);
      throw new Error('Database operation failed.');
    }

    return newFlashcard as Flashcard;
  }

  /**
   * Pobiera pojedynczą fiszkę po ID.
   */
  async getFlashcardById(
    flashcardId: string,
    userId: string
  ): Promise<Flashcard | null> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .select('*')
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching flashcard:', error);
      throw new Error('Database operation failed.');
    }

    return data as Flashcard | null;
  }

  /**
   * Aktualizuje istniejącą fiszkę.
   * Uses RLS policies to ensure users can only update their own flashcards.
   */
  async updateFlashcard(
    flashcardId: string,
    userId: string,
    data: UpdateFlashcardRequest
  ): Promise<Flashcard> {
    const updateData: any = {};

    if (data.front !== undefined) updateData.front = data.front.trim();
    if (data.back !== undefined) updateData.back = data.back.trim();
    if (data.part_of_speech !== undefined) updateData.part_of_speech = data.part_of_speech;

    const { data: updatedFlashcard, error } = await this.supabase
      .from('flashcards')
      .update(updateData)
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating flashcard:', error);
      
      // Check if flashcard doesn't exist or user doesn't have access
      if (error.code === 'PGRST116') {
        throw new Error('Flashcard not found or access denied.');
      }
      
      throw new Error('Database operation failed.');
    }

    if (!updatedFlashcard) {
      throw new Error('Flashcard not found or access denied.');
    }

    return updatedFlashcard as Flashcard;
  }
      console.error('Error updating flashcard:', error);
      if (error.code === 'PGRST116') {
        throw new Error('FLASHCARD_NOT_FOUND');
      }
      throw new Error('Database operation failed.');
    }

    return updatedFlashcard as Flashcard;
  }

  /**
   * Usuwa fiszkę.
   */
  async deleteFlashcard(flashcardId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('flashcards')
      .delete()
      .eq('id', flashcardId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting flashcard:', error);
      throw new Error('Database operation failed.');
    }
  }

  /**
   * Tworzy wiele fiszek naraz (bulk insert).
   */
  async bulkCreateFlashcards(
    userId: string,
    flashcards: CreateFlashcardRequest[]
  ): Promise<{ count: number; flashcards: Flashcard[] }> {
    const flashcardsToInsert: TablesInsert<'flashcards'>[] = flashcards.map((card) => ({
      user_id: userId,
      front: card.front.trim(),
      back: card.back.trim(),
      part_of_speech: card.part_of_speech || null,
      ai_generated: card.ai_generated || false,
      leitner_box: 1,
      review_due_at: new Date().toISOString(),
    }));

    const { data, error } = await this.supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select();

    if (error) {
      console.error('Error bulk creating flashcards:', error);
      throw new Error('Database operation failed.');
    }

    return {
      count: data.length,
      flashcards: data as Flashcard[],
    };
  }
}

