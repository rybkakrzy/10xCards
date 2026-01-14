import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import type { ReviewFlashcard } from '@/types';
import { calculateNextReview } from '@/lib/leitner';

export type GetReviewSessionOptions = {
  userId: string;
  limit?: number;
};

export type UpdateCardReviewOptions = {
  flashcardId: string;
  userId: string;
  knewIt: boolean;
};

export class ReviewService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Pobiera fiszki do powtórki dla danego użytkownika.
   */
  async getReviewSessionCards(
    options: GetReviewSessionOptions
  ): Promise<ReviewFlashcard[]> {
    const { userId, limit = 50 } = options;
    const now = new Date().toISOString();

    const { data: flashcards, error } = await this.supabase
      .from('flashcards')
      .select('id, front, back, part_of_speech, leitner_box')
      .eq('user_id', userId)
      .lte('review_due_at', now)
      .order('leitner_box', { ascending: true })
      .order('review_due_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching review session cards:', error);
      throw new Error('Failed to retrieve review session cards from the database.');
    }

    return (flashcards as ReviewFlashcard[]) || [];
  }

  /**
   * Aktualizuje status przeglądu fiszki.
   * Jeśli funkcja RPC jest dostępna, używa jej. W przeciwnym razie używa lokalnej logiki Leitnera.
   */
  async updateCardReviewStatus(options: UpdateCardReviewOptions): Promise<void> {
    const { flashcardId, userId, knewIt } = options;

    // Sprawdź czy funkcja RPC istnieje, jeśli tak - użyj jej
    try {
      const { error: rpcError } = await this.supabase.rpc('update_flashcard_review', {
        p_flashcard_id: flashcardId,
        p_knew_it: knewIt,
      });

      if (!rpcError) {
        return; // Sukces - funkcja RPC zadziałała
      }

      // Jeśli funkcja RPC nie istnieje, spadamy do lokalnej logiki
      console.warn('RPC function not available, using local Leitner logic');
    } catch (error) {
      console.warn('RPC call failed, using local Leitner logic:', error);
    }

    // Lokalna implementacja systemu Leitnera
    // Pobierz obecną fiszkę
    const { data: flashcard, error: fetchError } = await this.supabase
      .from('flashcards')
      .select('leitner_box')
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !flashcard) {
      console.error('Error fetching flashcard:', fetchError);
      throw new Error('FLASHCARD_NOT_FOUND');
    }

    // Oblicz następną datę przeglądu używając lokalnej funkcji
    const currentBox = flashcard.leitner_box as 1 | 2 | 3 | 4 | 5;
    const nextReview = calculateNextReview(currentBox, knewIt);

    // Zaktualizuj fiszkę
    const { error: updateError } = await this.supabase
      .from('flashcards')
      .update({
        leitner_box: nextReview.leitner_box,
        review_due_at: nextReview.review_due_at.toISOString(),
      })
      .eq('id', flashcardId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating card review status:', updateError);
      throw new Error('Failed to update card review status.');
    }
  }

  /**
   * Pobiera liczbę fiszek do powtórki.
   */
  async getReviewCount(userId: string): Promise<number> {
    const now = new Date().toISOString();

    const { count, error } = await this.supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lte('review_due_at', now);

    if (error) {
      console.error('Error counting review cards:', error);
      throw new Error('Failed to count review cards.');
    }

    return count ?? 0;
  }
}

