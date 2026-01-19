import { describe, it, expect, vi } from 'vitest';
import { flashcardService } from '../../../src/lib/services/flashcard.service';
import { createMockSupabaseClient, createMockFlashcard } from '../../setup/supabase.mock';

/**
 * Unit tests for flashcard.service.ts
 * 
 * Tests the business logic for flashcard operations including:
 * - Creating flashcards
 * - Fetching flashcards with pagination
 * - Updating flashcards
 * - Error handling
 */

describe('flashcard.service', () => {
  describe('createFlashcard', () => {
    it('should create a flashcard with valid data', async () => {
      // Arrange
      const mockFlashcard = createMockFlashcard({
        front: 'hello',
        back: 'cześć (powitanie)',
        part_of_speech: 'noun',
      });

      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockFlashcard,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await flashcardService.createFlashcard(
        mockSupabase,
        'test-user-id',
        {
          front: 'hello',
          back: 'cześć (powitanie)',
          part_of_speech: 'noun',
        }
      );

      // Assert
      expect(result).toEqual(mockFlashcard);
      expect(result.leitner_box).toBe(1);
      expect(result.front).toBe('hello');
    });

    it('should throw error when database operation fails', async () => {
      // Arrange
      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            }),
          }),
        }),
      });

      // Act & Assert
      await expect(
        flashcardService.createFlashcard(mockSupabase, 'test-user-id', {
          front: 'test',
          back: 'test',
          part_of_speech: null,
        })
      ).rejects.toThrow('Database operation failed');
    });
  });

  describe('getFlashcards', () => {
    it('should return paginated flashcards', async () => {
      // Arrange
      const mockFlashcards = [
        createMockFlashcard({ id: 'flash-1', front: 'hello' }),
        createMockFlashcard({ id: 'flash-2', front: 'goodbye' }),
      ];

      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockImplementation((query: string) => {
            if (query === '*') {
              return {
                eq: vi.fn().mockResolvedValue({
                  count: 2,
                  error: null,
                }),
              };
            }
            return {
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  range: vi.fn().mockResolvedValue({
                    data: mockFlashcards,
                    error: null,
                  }),
                }),
              }),
            };
          }),
        }),
      });

      // Act
      const result = await flashcardService.getFlashcards(mockSupabase, 'test-user-id', {
        page: 1,
        pageSize: 20,
        sortBy: 'created_at',
        order: 'desc',
      });

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalItems).toBe(2);
    });
  });

  describe('updateFlashcard', () => {
    it('should update flashcard fields', async () => {
      // Arrange
      const updatedFlashcard = createMockFlashcard({
        front: 'updated hello',
        back: 'zaktualizowane cześć',
      });

      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: updatedFlashcard,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await flashcardService.updateFlashcard(
        mockSupabase,
        'flashcard-123',
        'test-user-id',
        { front: 'updated hello' }
      );

      // Assert
      expect(result).toEqual(updatedFlashcard);
      expect(result?.front).toBe('updated hello');
    });

    it('should return null when flashcard not found', async () => {
      // Arrange
      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' },
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await flashcardService.updateFlashcard(
        mockSupabase,
        'non-existent-id',
        'test-user-id',
        { front: 'test' }
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getFlashcardById', () => {
    it('should return flashcard by id', async () => {
      // Arrange
      const mockFlashcard = createMockFlashcard({ id: 'test-id-123' });

      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockFlashcard,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await flashcardService.getFlashcardById(mockSupabase, 'test-id-123');

      // Assert
      expect(result).toEqual(mockFlashcard);
      expect(result?.id).toBe('test-id-123');
    });

    it('should return null when flashcard not found', async () => {
      // Arrange
      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await flashcardService.getFlashcardById(mockSupabase, 'non-existent-id');

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      // Arrange
      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST500', message: 'Database error' },
              }),
            }),
          }),
        }),
      });

      // Act & Assert
      await expect(
        flashcardService.getFlashcardById(mockSupabase, 'test-id')
      ).rejects.toThrow('Database operation failed.');
    });
  });

  describe('deleteFlashcard', () => {
    it('should delete flashcard successfully', async () => {
      // Arrange
      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await flashcardService.deleteFlashcard(
        mockSupabase,
        'flashcard-123',
        'test-user-id'
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should throw error when delete fails', async () => {
      // Arrange
      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: { message: 'Delete failed' },
              }),
            }),
          }),
        }),
      });

      // Act & Assert
      await expect(
        flashcardService.deleteFlashcard(mockSupabase, 'flashcard-123', 'test-user-id')
      ).rejects.toThrow('Database operation failed.');
    });
  });

  describe('importAiFlashcards', () => {
    it('should import AI flashcards successfully', async () => {
      // Arrange
      const importCommand = {
        flashcards: [
          { front: 'hello', back: 'cześć', part_of_speech: 'noun' },
          { front: 'goodbye', back: 'do widzenia', part_of_speech: 'phrase' },
        ],
        metrics: {
          generatedCount: 2,
          importedCount: 2,
        },
      };

      const expectedResponse = {
        imported_count: 2,
        flashcard_ids: ['id-1', 'id-2'],
      };

      const mockSupabase = createMockSupabaseClient({
        rpc: vi.fn().mockResolvedValue({
          data: expectedResponse,
          error: null,
        }),
      });

      // Act
      const result = await flashcardService.importAiFlashcards(
        mockSupabase,
        'test-user-id',
        importCommand,
        'B1'
      );

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('import_ai_flashcards', {
        flashcards_data: importCommand.flashcards,
        language_level_input: 'B1',
        metrics_data: importCommand.metrics,
        user_id_input: 'test-user-id',
      });
    });

    it('should throw error when import fails', async () => {
      // Arrange
      const importCommand = {
        flashcards: [{ front: 'test', back: 'test', part_of_speech: 'noun' }],
        metrics: {
          generatedCount: 1,
          importedCount: 0,
        },
      };

      const mockSupabase = createMockSupabaseClient({
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'RPC failed' },
        }),
      });

      // Act & Assert
      await expect(
        flashcardService.importAiFlashcards(mockSupabase, 'test-user-id', importCommand, 'A1')
      ).rejects.toThrow('Database transaction failed.');
    });
  });
});
