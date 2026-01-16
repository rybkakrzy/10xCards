import { z } from 'zod';

/**
 * Schema walidacji dla tworzenia nowej fiszki.
 * Zapewnia że pola 'front' i 'back' są niepustymi stringami o maksymalnej długości.
 * Pole 'part_of_speech' jest opcjonalne.
 */
export const CreateFlashcardSchema = z.object({
  front: z.string({ required_error: 'Słowo w języku hiszpańskim jest wymagane.' })
    .min(1, 'Słowo nie może być puste.')
    .max(255, 'Słowo nie może przekroczyć 255 znaków.'),
  back: z.string({ required_error: 'Tłumaczenie jest wymagane.' })
    .min(1, 'Tłumaczenie nie może być puste.')
    .max(255, 'Tłumaczenie nie może przekroczyć 255 znaków.'),
  part_of_speech: z.string().max(50).optional(),
  ai_generated: z.boolean().optional().default(false),
});

/**
 * Schema walidacji dla ID fiszki z URL.
 * Zapewnia że 'flashcardId' jest prawidłowym UUID.
 */
export const GetFlashcardParamsSchema = z.object({
  id: z.string().uuid({ message: 'ID fiszki musi być prawidłowym UUID.' }),
});

/**
 * Schema walidacji dla aktualizacji istniejącej fiszki.
 * Wszystkie pola opcjonalne aby umożliwić częściowe aktualizacje.
 */
export const UpdateFlashcardSchema = z.object({
  front: z.string()
    .min(1, 'Słowo nie może być puste.')
    .max(249, 'Słowo nie może przekroczyć 249 znaków.')
    .optional(),
  back: z.string()
    .min(1, 'Tłumaczenie nie może być puste.')
    .max(249, 'Tłumaczenie nie może przekroczyć 249 znaków.')
    .optional(),
  part_of_speech: z.string()
    .max(249, 'Część mowy nie może przekroczyć 249 znaków.')
    .nullable()
    .optional(),
});

/**
 * Schema walidacji dla bulk import fiszek.
 */
const flashcardImportItemSchema = z.object({
  front: z.string().min(1, 'Słowo w języku hiszpańskim jest wymagane'),
  back: z.string().min(1, 'Tłumaczenie jest wymagane'),
  part_of_speech: z.string().optional(),
  ai_generated: z.boolean().optional().default(true),
});

export const ImportFlashcardsRequestSchema = z.object({
  flashcards: z.array(flashcardImportItemSchema)
    .min(1, 'Wymagana jest co najmniej jedna fiszka')
    .max(20, 'Maksymalnie 20 fiszek na raz'),
});

/**
 * Schema walidacji dla aktualizacji statusu przeglądu fiszki.
 */
export const UpdateCardReviewSchema = z.object({
  flashcardId: z.string().uuid('ID fiszki musi być prawidłowym UUID.'),
  knewIt: z.boolean({ required_error: 'Parametr knewIt jest wymagany.' }),
});

/**
 * Schema walidacji dla generowania fiszek AI.
 */
export const GenerateSuggestionsSchema = z.object({
  text: z.string()
    .min(10, 'Tekst musi mieć co najmniej 10 znaków.')
    .max(2000, 'Tekst nie może przekroczyć 2000 znaków.'),
  level: z.enum(['A2', 'B1', 'B2'], {
    required_error: 'Poziom jest wymagany.',
    invalid_type_error: 'Poziom musi być jednym z: A2, B1, B2.',
  }),
});

/**
 * Schema walidacji dla parametrów query przy listowaniu fiszek.
 */
export const GetFlashcardsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['created_at', 'front', 'leitner_box']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Schema walidacji dla aktualizacji profilu użytkownika.
 * Umożliwia aktualizację domyślnego poziomu AI.
 */
export const updateProfileSchema = z.object({
  default_ai_level: z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2'], {
    required_error: 'default_ai_level jest wymagane.',
    invalid_type_error: 'default_ai_level musi być prawidłowym poziomem językowym (a1, a2, b1, b2, c1, c2).',
  }),
});

