import type { APIRoute } from 'astro';
import { createServerClient } from '@/db/supabase';
import type { CreateFlashcardRequest, CreateFlashcardResponse } from '@/types';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check authentication
    if (!locals.user || !locals.accessToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: CreateFlashcardRequest = await request.json();

    // Validate input
    if (!body.front || !body.back) {
      return new Response(
        JSON.stringify({ error: 'Front and back are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createServerClient(locals.accessToken);

    // Insert flashcard
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        user_id: locals.user.id,
        front: body.front.trim(),
        back: body.back.trim(),
        part_of_speech: body.part_of_speech || null,
        ai_generated: body.ai_generated || false,
        leitner_box: 1,
        review_due_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create flashcard' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response: CreateFlashcardResponse = { flashcard: data };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create flashcard error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Check authentication
    if (!locals.user || !locals.accessToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createServerClient(locals.accessToken);

    // Get all user's flashcards
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', locals.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch flashcards' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ flashcards: data || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get flashcards error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

