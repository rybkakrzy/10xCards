import type { APIRoute } from 'astro';
import { ReviewService } from '@/lib/services/review.service';

export const GET: APIRoute = async ({ locals }) => {
  try {
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

    const reviewService = new ReviewService(supabase);
    const flashcards = await reviewService.getReviewSessionCards({
      userId: user.id,
      limit: 50,
    });

    return new Response(
      JSON.stringify({
        flashcards,
        count: flashcards.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/review:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to load flashcards for review' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
