-- Migracja inicjalna dla 10xCards - Aplikacji do nauki języka hiszpańskiego
-- Tworzy tabele: profiles, flashcards, ai_generation_logs oraz niezbędne funkcje i triggery

-- Krok 1: Utwórz typ wyliczeniowy dla poziomów językowych
create type public.language_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- Krok 2: Utwórz tabelę profili użytkowników
create table public.profiles (
    id uuid not null primary key references auth.users(id) on delete cascade,
    default_ai_level text not null default 'B1',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Krok 3: Włącz RLS (Row Level Security) dla profili
alter table public.profiles enable row level security;

-- Krok 4: Utwórz polityki RLS dla profili
create policy "allow authenticated select access on profiles"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "allow authenticated update access on profiles"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Krok 5: Utwórz tabelę fiszek
create table public.flashcards (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    front text not null check (length(front) > 0 and length(front) < 250),
    back text not null check (length(back) > 0 and length(back) < 250),
    part_of_speech text null,
    ai_generated boolean not null default false,
    flashcard_language_level public.language_level null,
    leitner_box smallint not null default 1 check (leitner_box > 0 and leitner_box <= 5),
    review_due_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Krok 6: Włącz RLS dla fiszek
alter table public.flashcards enable row level security;

-- Krok 7: Utwórz polityki RLS dla fiszek
create policy "allow authenticated select access on flashcards"
on public.flashcards for select
to authenticated
using (auth.uid() = user_id);

create policy "allow authenticated insert access on flashcards"
on public.flashcards for insert
to authenticated
with check (auth.uid() = user_id);

create policy "allow authenticated update access on flashcards"
on public.flashcards for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "allow authenticated delete access on flashcards"
on public.flashcards for delete
to authenticated
using (auth.uid() = user_id);

-- Krok 8: Utwórz tabelę logów generowania AI
create table public.ai_generation_logs (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    generated_count smallint not null check (generated_count >= 0),
    imported_count smallint not null check (imported_count >= 0),
    created_at timestamptz not null default now()
);

-- Krok 9: Włącz RLS dla logów AI
alter table public.ai_generation_logs enable row level security;

-- Krok 10: Utwórz polityki RLS dla logów AI
create policy "allow authenticated select access on ai_generation_logs"
on public.ai_generation_logs for select
to authenticated
using (auth.uid() = user_id);

create policy "allow authenticated insert access on ai_generation_logs"
on public.ai_generation_logs for insert
to authenticated
with check (auth.uid() = user_id);

-- Krok 11: Utwórz funkcję i trigger do automatycznego tworzenia profilu dla nowego użytkownika
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, default_ai_level)
  values (new.id, 'B1');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Krok 12: Utwórz funkcję do aktualizacji statusu przeglądu fiszki (Leitner system)
create or replace function public.update_flashcard_review(p_flashcard_id uuid, p_knew_it boolean)
returns void as $$
declare
  v_current_box smallint;
begin
  -- Pobierz obecne pudełko fiszki
  select leitner_box into v_current_box 
  from public.flashcards 
  where id = p_flashcard_id and user_id = auth.uid();

  if v_current_box is null then
    -- Fiszka nie istnieje lub nie należy do użytkownika
    return;
  end if;

  if p_knew_it then
    -- Użytkownik znał odpowiedź -> przesuń do następnego pudełka
    case v_current_box
      when 1 then
        update public.flashcards 
        set leitner_box = 2, review_due_at = now() + interval '1 day' 
        where id = p_flashcard_id;
      when 2 then
        update public.flashcards 
        set leitner_box = 3, review_due_at = now() + interval '3 days' 
        where id = p_flashcard_id;
      when 3 then
        update public.flashcards 
        set leitner_box = 4, review_due_at = now() + interval '7 days' 
        where id = p_flashcard_id;
      when 4 then
        update public.flashcards 
        set leitner_box = 5, review_due_at = now() + interval '14 days' 
        where id = p_flashcard_id;
      else -- pudełko 5
        update public.flashcards 
        set leitner_box = 5, review_due_at = now() + interval '30 days' 
        where id = p_flashcard_id;
    end case;
  else
    -- Użytkownik nie znał odpowiedzi -> zresetuj do pudełka 1
    update public.flashcards 
    set leitner_box = 1, review_due_at = now() 
    where id = p_flashcard_id;
  end if;
end;
$$ language plpgsql;

-- Krok 13: Funkcja do automatycznej aktualizacji updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger do automatycznej aktualizacji updated_at dla profili
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Trigger do automatycznej aktualizacji updated_at dla fiszek
create trigger set_flashcards_updated_at
  before update on public.flashcards
  for each row
  execute function public.handle_updated_at();

-- Krok 14: Utwórz indeksy dla optymalizacji wydajności
-- Indeks dla efektywnego pobierania fiszek do powtórki
create index flashcards_review_session_idx 
on public.flashcards (user_id, review_due_at, leitner_box);

-- Indeks dla szybkiego ładowania listy fiszek użytkownika
create index flashcards_user_list_idx 
on public.flashcards (user_id, created_at desc);

-- Indeks dla filtrowania po pudełku Leitnera
create index flashcards_leitner_box_idx 
on public.flashcards (user_id, leitner_box);


