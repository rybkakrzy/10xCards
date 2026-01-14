# Tech Stack - 10xCards (Szczegółowy)

## Frontend

**Astro 5 + React 19**
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna (formularze, sesje nauki, zarządzanie stanem)
- Routing: Astro file-based routing
- Server-Side Rendering (SSR) dla optymalnej wydajności

**TypeScript 5**
- Statyczne typowanie kodu
- Lepsze wsparcie IDE i mniej błędów w runtime
- Wspólne typy dla frontendu i backendu

**Tailwind CSS 4**
- Utility-first CSS framework
- Szybkie prototypowanie i spójny design
- Responsywność out-of-the-box

**Shadcn/ui**
- Biblioteka dostępnych komponentów React
- Komponenty zbudowane na Radix UI
- Łatwa customizacja
- Przykłady: Button, Input, Dialog, Toast, Dropdown

## Backend

**Supabase jako Backend-as-a-Service**
- **Baza danych**: PostgreSQL (relacyjna, ACID)
- **SDK**: Klient JavaScript/TypeScript jako warstwa dostępu do danych
- **Autentykacja**: Wbudowany system auth (email/password, social login)
- **Row Level Security (RLS)**: Zabezpieczenie danych na poziomie bazy
- **Real-time subscriptions**: Opcjonalnie na przyszłość
- **Open source**: Możliwość self-hostingu

**Struktura bazy danych:**
```sql
-- Tabela users (zarządzana przez Supabase Auth)
auth.users

-- Tabela fiszek
public.flashcards
  - id (uuid, primary key)
  - user_id (uuid, foreign key -> auth.users)
  - front (text) -- słowo hiszpańskie
  - back (text) -- tłumaczenie polskie
  - part_of_speech (text, nullable) -- część mowy
  - leitner_box (integer, 1-3) -- pudełko Leitnera
  - review_due_at (timestamp) -- kiedy powtórzyć
  - ai_generated (boolean) -- czy wygenerowane przez AI
  - created_at (timestamp)
  - updated_at (timestamp)
```

## AI / LLM

**OpenRouter.ai**
- Dostęp do szerokiej gamy modeli LLM (OpenAI, Anthropic, Google, Meta, Mistral i inne)
- Możliwość porównywania kosztów i wyboru najbardziej efektywnego modelu
- Ustawianie limitów finansowych na klucze API
- Zunifikowane API dla różnych providerów

**Modele do rozważenia:**
- **Anthropic Claude Haiku**: Szybki, tani, dobry do prostych zadań
- **Mistral**: Open source, competitive pricing
- **GPT-3.5-turbo**: Sprawdzony, szybki

**Prompt dla generowania fiszek:**
```
Wygeneruj do 20 fiszek z najtrudniejszych hiszpańskich słówek z poniższego tekstu.
Poziom trudności: [A2/B1/B2]
Format odpowiedzi: JSON
{"fiszki": [{"front": "palabra", "back": "słowo (rzeczownik)"}, ...]}

Tekst: [USER_INPUT]
```

## CI/CD i Hosting

**GitHub Actions**
- Automatyczne testy (linting, type checking)
- Build aplikacji
- Deploy do DigitalOcean

**DigitalOcean**
- Hosting aplikacji przez Docker
- App Platform lub Droplet z Docker
- PostgreSQL jako managed database (opcjonalnie, jeśli nie używamy Supabase Cloud)

**Docker**
- Konteneryzacja aplikacji Astro
- Łatwe wdrożenie i skalowanie
- Spójne środowisko dev/prod

## Development Tools

- **ESLint + Prettier**: Linting i formatowanie kodu
- **Husky + lint-staged**: Pre-commit hooks
- **VS Code / Cursor / Windsurf**: IDE z AI
- **Git**: Version control
- **npm**: Package manager

## Bezpieczeństwo

- **Supabase RLS**: Row Level Security dla izolacji danych użytkowników
- **Environment variables**: Przechowywanie kluczy API
- **HTTPS**: Szyfrowanie komunikacji
- **Input validation**: Walidacja danych po stronie serwera i klienta
- **Rate limiting**: Ochrona przed nadużyciami API

