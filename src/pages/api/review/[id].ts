import type { APIRoute } from 'astro';
import { ReviewService } from '@/lib/services/review.service';

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Flashcard ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { supabase } = locals;
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { result } = body;

    if (!result || !['correct', 'incorrect'].includes(result)) {
      return new Response(
        JSON.stringify({ error: 'Invalid result. Must be "correct" or "incorrect"' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const reviewService = new ReviewService(supabase);
    await reviewService.updateCardReviewStatus({
      flashcardId: id,
      userId: user.id,
      knewIt: result === 'correct',
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in POST /api/review/[id]:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update review status' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
