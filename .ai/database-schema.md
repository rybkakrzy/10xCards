# Database Schema - Supabase

## Tables

### `flashcards`

Przechowuje fiszki użytkowników do nauki języka hiszpańskiego.

```sql
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL, -- Słowo/fraza po hiszpańsku
  back TEXT NOT NULL, -- Tłumaczenie po polsku
  part_of_speech TEXT, -- Część mowy (opcjonalnie): rzeczownik, czasownik, przymiotnik, etc.
  leitner_box INTEGER NOT NULL DEFAULT 1 CHECK (leitner_box >= 1 AND leitner_box <= 3),
  review_due_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ai_generated BOOLEAN NOT NULL DEFAULT false, -- Czy fiszka została wygenerowana przez AI
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indeksy dla lepszej wydajności
CREATE INDEX idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX idx_flashcards_review_due ON public.flashcards(user_id, review_due_at);
CREATE INDEX idx_flashcards_leitner_box ON public.flashcards(user_id, leitner_box);

-- Funkcja do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger do automatycznej aktualizacji updated_at
CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS)

Włączenie RLS zapewnia, że użytkownicy mają dostęp tylko do swoich fiszek.

```sql
-- Włączenie RLS dla tabeli flashcards
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Policy: Użytkownik może widzieć tylko swoje fiszki
CREATE POLICY "Users can view their own flashcards"
  ON public.flashcards
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Użytkownik może dodawać swoje fiszki
CREATE POLICY "Users can insert their own flashcards"
  ON public.flashcards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Użytkownik może aktualizować swoje fiszki
CREATE POLICY "Users can update their own flashcards"
  ON public.flashcards
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Użytkownik może usuwać swoje fiszki
CREATE POLICY "Users can delete their own flashcards"
  ON public.flashcards
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Przykładowe zapytania

### Pobranie fiszek do powtórki (sesja nauki)

```sql
SELECT *
FROM flashcards
WHERE user_id = auth.uid()
  AND review_due_at <= NOW()
ORDER BY leitner_box ASC, review_due_at ASC;
```

### Pobranie wszystkich fiszek użytkownika

```sql
SELECT *
FROM flashcards
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Dodanie nowej fiszki (wygenerowanej przez AI)

```sql
INSERT INTO flashcards (user_id, front, back, part_of_speech, ai_generated, leitner_box, review_due_at)
VALUES (
  auth.uid(),
  'palabra',
  'słowo (rzeczownik)',
  'rzeczownik',
  true,
  1,
  NOW()
);
```

### Aktualizacja fiszki po ocenie "Wiem" (Box 1 → 2)

```sql
UPDATE flashcards
SET 
  leitner_box = 2,
  review_due_at = NOW() + INTERVAL '1 day'
WHERE id = 'uuid-fiszki'
  AND user_id = auth.uid();
```

### Aktualizacja fiszki po ocenie "Nie wiem" (→ Box 1)

```sql
UPDATE flashcards
SET 
  leitner_box = 1,
  review_due_at = NOW()
WHERE id = 'uuid-fiszki'
  AND user_id = auth.uid();
```

## Metryki (opcjonalnie - do śledzenia statystyk)

Jeśli chcesz śledzić metryki sukcesu, możesz dodać tabelę:

```sql
CREATE TABLE public.flashcard_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'ai_generated', 'ai_accepted', 'ai_rejected', 'manual_created', 'reviewed'
  flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flashcard_events_user_id ON public.flashcard_events(user_id);
CREATE INDEX idx_flashcard_events_type ON public.flashcard_events(event_type);
```

## Migracja danych (opcjonalnie)

Jeśli planujesz migrację z innego systemu lub backup:

```sql
-- Export do JSON
COPY (SELECT * FROM flashcards WHERE user_id = 'user-uuid') TO '/path/to/backup.json';

-- Import z JSON (wymaga rozszerzenia)
-- Użyj Supabase Dashboard lub klienta JS/TS
```

