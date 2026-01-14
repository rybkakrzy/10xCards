// OpenRouter API service for AI flashcard generation

interface OpenRouterRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
  part_of_speech?: string;
}

export interface GenerateFlashcardsParams {
  text: string;
  level: 'A2' | 'B1' | 'B2';
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-3-haiku'; // Fast and cheap model

export class OpenRouterService {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    this.apiKey = apiKey;
  }

  private createPrompt(text: string, level: string): string {
    return `Jesteś ekspertem od nauki języka hiszpańskiego. Na podstawie poniższego tekstu w języku hiszpańskim, wygeneruj do 20 fiszek z najtrudniejszymi słówkami odpowiednimi dla poziomu ${level} CEFR.

WYMAGANIA:
1. Wybierz najbardziej wartościowe słowa do nauki (rzeczowniki, czasowniki, przymiotniki, przysłówki)
2. Unikaj bardzo podstawowych słów (jak "el", "la", "y", "es")
3. Dla rzeczowników zawsze dodaj rodzajnik (el/la)
4. Format odpowiedzi: JSON
5. Struktura: {"fiszki": [{"front": "słowo ES", "back": "tłumaczenie PL (część mowy)", "part_of_speech": "część mowy"}, ...]}
6. Część mowy po polsku: rzeczownik, czasownik, przymiotnik, przysłówek, zaimek, przyimek, spójnik, wykrzyknik, fraza

Przykład poprawnej odpowiedzi:
{"fiszki": [{"front": "el perro", "back": "pies (rzeczownik)", "part_of_speech": "rzeczownik"}, {"front": "correr", "back": "biegać (czasownik)", "part_of_speech": "czasownik"}]}

TEKST DO ANALIZY:
${text}

Odpowiedz TYLKO w formacie JSON, bez dodatkowych komentarzy.`;
  }

  async generateFlashcards(params: GenerateFlashcardsParams): Promise<GeneratedFlashcard[]> {
    const { text, level } = params;

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (text.length > 2000) {
      throw new Error('Text too long (max 2000 characters)');
    }

    const requestBody: OpenRouterRequest = {
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates Spanish language flashcards in JSON format.',
        },
        {
          role: 'user',
          content: this.createPrompt(text, level),
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    };

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://10xcards.com', // Optional, for OpenRouter analytics
          'X-Title': '10xCards', // Optional, for OpenRouter analytics
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI model');
      }

      const content = data.choices[0].message.content;

      // Parse JSON response
      const parsed = JSON.parse(content);

      if (!parsed.fiszki || !Array.isArray(parsed.fiszki)) {
        throw new Error('Invalid response format from AI');
      }

      // Validate and transform flashcards
      return parsed.fiszki.map((card: any) => ({
        front: card.front || '',
        back: card.back || '',
        part_of_speech: card.part_of_speech || null,
      })) as GeneratedFlashcard[];
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse AI response as JSON');
      }
      throw error;
    }
  }
}

// Singleton instance
let openRouterService: OpenRouterService | null = null;

export function getOpenRouterService(): OpenRouterService {
  if (!openRouterService) {
    // Astro handles import.meta.env natively
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }
    openRouterService = new OpenRouterService(apiKey);
  }
  return openRouterService;
}

