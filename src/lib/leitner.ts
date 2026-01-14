// Service for Leitner box algorithm operations
import type { LeitnerBox } from '@/types';

export const REVIEW_INTERVALS = {
  BOX_1_TO_2: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  BOX_2_TO_3: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
  BOX_3_TO_4: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  BOX_4_TO_5: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
  BOX_5: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
} as const;

export interface LeitnerUpdateResult {
  leitner_box: 1 | 2 | 3 | 4 | 5;
  review_due_at: Date;
}

/**
 * Calculate next review date and box based on current box and result
 * @param currentBox Current Leitner box (1, 2, 3, 4, or 5)
 * @param isCorrect Whether the user answered correctly
 * @returns Updated box number and review date
 */
export function calculateNextReview(
  currentBox: LeitnerBox | number,
  isCorrect: boolean
): LeitnerUpdateResult {
  const now = new Date();

  // If answer is incorrect, reset to box 1 and review immediately
  if (!isCorrect) {
    return {
      leitner_box: 1,
      review_due_at: now,
    };
  }

  // If answer is correct, move to next box (or stay in box 5)
  switch (currentBox) {
    case 1:
      // Move from box 1 to box 2, review in 1 day
      return {
        leitner_box: 2,
        review_due_at: new Date(now.getTime() + REVIEW_INTERVALS.BOX_1_TO_2),
      };

    case 2:
      // Move from box 2 to box 3, review in 3 days
      return {
        leitner_box: 3,
        review_due_at: new Date(now.getTime() + REVIEW_INTERVALS.BOX_2_TO_3),
      };

    case 3:
      // Move from box 3 to box 4, review in 7 days
      return {
        leitner_box: 4,
        review_due_at: new Date(now.getTime() + REVIEW_INTERVALS.BOX_3_TO_4),
      };

    case 4:
      // Move from box 4 to box 5, review in 14 days
      return {
        leitner_box: 5,
        review_due_at: new Date(now.getTime() + REVIEW_INTERVALS.BOX_4_TO_5),
      };

    case 5:
      // Stay in box 5, review in 30 days
      return {
        leitner_box: 5,
        review_due_at: new Date(now.getTime() + REVIEW_INTERVALS.BOX_5),
      };

    default:
      throw new Error(`Invalid Leitner box: ${currentBox}`);
  }
}

/**
 * Check if a flashcard is due for review
 * @param reviewDueAt ISO timestamp string
 * @returns True if the flashcard should be reviewed now
 */
export function isDueForReview(reviewDueAt: string): boolean {
  const dueDate = new Date(reviewDueAt);
  const now = new Date();
  return dueDate <= now;
}

/**
 * Format review date for display
 * @param reviewDueAt ISO timestamp string
 * @returns Formatted date string
 */
export function formatReviewDate(reviewDueAt: string): string {
  const date = new Date(reviewDueAt);
  const now = new Date();

  // If in the past or today, show "Do powtórki"
  if (date <= now) {
    return 'Do powtórki';
  }

  // Calculate days difference
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Za 1 dzień';
  }

  return `Za ${diffDays} dni`;
}

/**
 * Get box color for UI display
 * @param box Leitner box number
 * @returns Tailwind color class
 */
export function getBoxColor(box: LeitnerBox): string {
  switch (box) {
    case 1:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 2:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 3:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

/**
 * Get box label for UI display
 * @param box Leitner box number
 * @returns Human-readable box label
 */
export function getBoxLabel(box: LeitnerBox): string {
  switch (box) {
    case 1:
      return 'Pudełko 1 (Nowe)';
    case 2:
      return 'Pudełko 2 (W trakcie)';
    case 3:
      return 'Pudełko 3 (Opanowane)';
    default:
      return 'Nieznane';
  }
}

