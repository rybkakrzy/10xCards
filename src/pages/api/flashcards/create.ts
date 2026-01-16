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
    const { front, back, part_of_speech } = body;

    if (!front || !front.trim() || !back || !back.trim()) {
      return new Response(JSON.stringify({ error: 'Front and back are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert flashcard
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        user_id: user.id,
        front: front.trim(),
        back: back.trim(),
        part_of_speech: part_of_speech || null,
        ai_generated: false,
        leitner_box: 1,
        review_due_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating flashcard:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create flashcard' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify(data),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
