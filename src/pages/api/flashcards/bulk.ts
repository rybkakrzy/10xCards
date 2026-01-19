import type { APIRoute } from 'astro';
import { supabase } from '@/db/supabase';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { flashcards } = body;

    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      return new Response(JSON.stringify({ error: 'Flashcards array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prepare flashcards for bulk insert
    const flashcardsToInsert = flashcards.map((card) => ({
      user_id: user.id,
      front: card.front,
      back: card.back,
      part_of_speech: card.part_of_speech || null,
      ai_generated: true,
      leitner_box: 1,
      review_due_at: new Date().toISOString(),
    }));

    // Insert flashcards
    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select();

    if (error) {
      console.error('Error inserting flashcards:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to import flashcards' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Flashcards imported successfully',
        importedCount: data.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error importing flashcards:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
