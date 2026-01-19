import type { APIRoute } from 'astro';
import { flashcardService } from '../../../lib/services/flashcard.service';
import { GetFlashcardParamsSchema, UpdateFlashcardSchema } from '../../../lib/validators';
import type { UpdateFlashcardRequest } from '../../../types';

export const prerender = false;

/**
 * GET endpoint to retrieve a single flashcard by ID.
 */
export const GET: APIRoute = async ({ params, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  // Validate flashcard ID from params
  const validation = GetFlashcardParamsSchema.safeParse(params);
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        message: 'Invalid flashcard ID.',
        errors: validation.error.flatten().fieldErrors,
      }),
      { status: 400 }
    );
  }

  const { id: flashcardId } = validation.data;

  try {
    const flashcard = await flashcardService.getFlashcardById(supabase, flashcardId);

    if (!flashcard) {
      return new Response(JSON.stringify({ message: 'Flashcard not found or access denied.' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    return new Response(JSON.stringify({ message: 'An internal server error occurred.' }), {
      status: 500,
    });
  }
};

/**
 * PATCH endpoint to update an existing flashcard.
 * Allows partial updates of front, back, and part_of_speech fields.
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { user } = locals;

  // Guard clause: Check authentication
  if (!user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate flashcard ID from URL params
  const paramsValidation = GetFlashcardParamsSchema.safeParse(params);
  
  if (!paramsValidation.success) {
    return new Response(
      JSON.stringify({
        message: 'Invalid flashcard ID.',
        errors: paramsValidation.error.flatten().fieldErrors,
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const { id: flashcardId } = paramsValidation.data;

  // Parse and validate request body
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Invalid JSON in request body.' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Guard clause: Check if request body is empty
  if (!requestBody || Object.keys(requestBody).length === 0) {
    return new Response(
      JSON.stringify({ message: 'Request body cannot be empty. Provide at least one field to update.' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Validate request body against schema
  const bodyValidation = UpdateFlashcardSchema.safeParse(requestBody);
  
  if (!bodyValidation.success) {
    return new Response(
      JSON.stringify({
        message: 'Invalid request data.',
        errors: bodyValidation.error.flatten().fieldErrors,
      }),
      { 
        status: 422,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Update flashcard through service
    const updatedFlashcard = await flashcardService.updateFlashcard(
      locals.supabase,
      flashcardId,
      user.id,
      bodyValidation.data as UpdateFlashcardRequest
    );

    // Happy path: Return updated flashcard
    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific errors
    if (errorMessage === 'Flashcard not found or access denied.') {
      return new Response(
        JSON.stringify({ message: errorMessage }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Log and return generic server error
    console.error('Error updating flashcard:', error);
    return new Response(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

/**
 * DELETE endpoint to remove a flashcard.
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate flashcard ID from params
  const validation = GetFlashcardParamsSchema.safeParse(params);
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        message: 'Invalid flashcard ID.',
        errors: validation.error.flatten().fieldErrors,
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const { id: flashcardId } = validation.data;

  try {
    await flashcardService.deleteFlashcard(supabase, flashcardId, user.id);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return new Response(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
