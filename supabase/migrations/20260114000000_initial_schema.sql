-- Migracja inicjalna dla 10xCards
-- Tworzy tabelę flashcards i podstawowe indeksy

-- Włącz RLS (Row Level Security)
alter database postgres set "app.jwt_secret" to 'your-jwt-secret-here';

-- Utwórz tabelę flashcards
create table if not exists public.flashcards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  front text not null,
  back text not null,
  part_of_speech text,
  leitner_box integer default 1 not null check (leitner_box between 1 and 3),
  review_due_at timestamptz default now() not null,
  ai_generated boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indeksy dla wydajności
create index if not exists flashcards_user_id_idx on public.flashcards(user_id);
create index if not exists flashcards_review_due_at_idx on public.flashcards(review_due_at);
create index if not exists flashcards_leitner_box_idx on public.flashcards(leitner_box);
create index if not exists flashcards_user_id_review_due_at_idx on public.flashcards(user_id, review_due_at);

-- Włącz RLS
alter table public.flashcards enable row level security;

-- Policy: użytkownicy mogą widzieć tylko swoje fiszki
create policy "Users can view their own flashcards"
  on public.flashcards for select
  using (auth.uid() = user_id);

-- Policy: użytkownicy mogą tworzyć własne fiszki
create policy "Users can create their own flashcards"
  on public.flashcards for insert
  with check (auth.uid() = user_id);

-- Policy: użytkownicy mogą aktualizować swoje fiszki
create policy "Users can update their own flashcards"
  on public.flashcards for update
  using (auth.uid() = user_id);

-- Policy: użytkownicy mogą usuwać swoje fiszki
create policy "Users can delete their own flashcards"
  on public.flashcards for delete
  using (auth.uid() = user_id);

-- Funkcja do automatycznej aktualizacji updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger do automatycznej aktualizacji updated_at
create trigger set_updated_at
  before update on public.flashcards
  for each row
  execute function public.handle_updated_at();

