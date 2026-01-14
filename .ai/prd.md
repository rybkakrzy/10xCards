# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu
10xCards to aplikacja internetowa zaprojektowana w celu usprawnienia procesu tworzenia fiszek edukacyjnych do nauki języka hiszpańskiego. Wykorzystując sztuczną inteligencję (AI), aplikacja automatycznie generuje fiszki z tekstu hiszpańskiego dostarczonego przez użytkownika, znacznie skracając czas potrzebny na ich przygotowanie. Projekt ma na celu rozwiązanie problemu czasochłonnego, manualnego tworzenia fiszek, co często zniechęca do stosowania skutecznych metod nauki, takich jak `spaced repetition`. Aplikacja umożliwi również manualne tworzenie i edycję fiszek, a także ich przechowywanie na indywidualnych kontach użytkowników. Wygenerowane fiszki zostaną zintegrowane z algorytmem powtórek Leitnera, aby ułatwić proces nauki.

## 2. Problem użytkownika
Głównym problemem, który rozwiązuje 10xCards, jest fakt, że manualne tworzenie wysokiej jakości fiszek edukacyjnych jest procesem powolnym i żmudnym. Osoby uczące się języka hiszpańskiego często rezygnują z tej formy nauki, mimo jej udowodnionej skuteczności, ze względu na barierę czasową i wysiłek wymagany do przygotowania materiałów. Brak prostego i szybkiego narzędzia do tworzenia fiszek ogranicza wykorzystanie metody `spaced repetition` na szerszą skalę.

## 3. Wymagania funkcjonalne
- RF-001: System rejestracji i logowania użytkowników za pomocą adresu e-mail i hasła, obsługiwany przez Supabase.
- RF-002: Generowanie fiszek (słowo/tłumaczenie) przez AI na podstawie tekstu hiszpańskiego wklejonego przez użytkownika (limit 2000 znaków).
- RF-003: Możliwość wyboru poziomu trudności słownictwa (A2, B1, B2), z domyślnym poziomem B1.
- RF-004: AI zwraca do 20 fiszek w formacie JSON: `{"fiszki": [{"front": "ES słowo", "back": "PL tłumaczenie (część mowy)"}, ...]}`.
- RF-005: Wyświetlanie wskaźnika ładowania podczas generowania fiszek przez AI.
- RF-006: Przeglądanie listy wygenerowanych propozycji fiszek przed ich zaakceptowaniem.
- RF-007: Możliwość edycji (inline) każdej wygenerowanej fiszki przed zaakceptowaniem.
- RF-008: Możliwość odrzucenia (usunięcia z listy) każdej wygenerowanej fiszki.
- RF-009: Przycisk "Dodaj [X] fiszek" zapisuje zaakceptowane fiszki do bazy danych z atrybutem `leitner_box = 1` i `review_due_at = NOW()`.
- RF-010: Możliwość manualnego tworzenia fiszek poprzez formularz z polami: "Front (ES)", "Tłumaczenie (PL)", "Część mowy (opcjonalnie)".
- RF-011: Przeglądanie wszystkich fiszek użytkownika na dedykowanej stronie "Moje Fiszki".
- RF-012: Możliwość edycji (inline) i usuwania istniejących fiszek.
- RF-013: System powtórek oparty na algorytmie Leitnera (3 pudełka).
- RF-014: Sesja nauki pobiera fiszki gdzie `review_due_at <= NOW()` posortowane według `leitner_box`.
- RF-015: Interfejs sesji pokazuje najpierw front fiszki (ES), po kliknięciu "Pokaż odpowiedź" odkrywa back (PL).
- RF-016: Ocena fiszki: "Wiem" lub "Nie wiem".
- RF-017: Logika aktualizacji:
  - "Nie wiem": `leitner_box = 1`, `review_due_at = NOW()`
  - "Wiem" (Box 1 → 2): `leitner_box = 2`, `review_due_at = NOW() + 1 dzień`
  - "Wiem" (Box 2 → 3): `leitner_box = 3`, `review_due_at = NOW() + 3 dni`
- RF-018: Ekran podsumowania po zakończeniu sesji nauki.
- RF-019: Obsługa błędów z komunikatami Toast dla użytkownika.
- RF-020: Każda fiszka ma atrybut `ai_generated` (boolean) wskazujący źródło utworzenia.
- RF-021: Dane użytkowników przechowywane zgodnie z RODO.
- RF-022: Prawo do wglądu i usunięcia danych (konto wraz z fiszkami) na wniosek użytkownika.

## 4. Granice produktu
Następujące funkcje celowo NIE wchodzą w zakres wersji MVP (Minimum Viable Product), aby umożliwić szybkie wdrożenie i weryfikację kluczowych założeń:
- Zaawansowane algorytmy powtórek (np. SuperMemo, Anki z więcej niż 3 pudełkami).
- Importowanie treści z różnych formatów plików (np. PDF, DOCX, URL).
- Tworzenie i zarządzanie wieloma taliami fiszek (wszystkie fiszki trafiają do jednej wspólnej bazy).
- Funkcje społecznościowe, takie jak współdzielenie talii fiszek między użytkownikami.
- Integracje z zewnętrznymi platformami edukacyjnymi (np. Duolingo, Babbel).
- Dedykowane aplikacje mobilne na systemy iOS i Android (projekt będzie dostępny jako aplikacja internetowa).
- Mechanizmy gamifikacji (punkty, osiągnięcia, rankingi).
- Rozbudowany system powiadomień push.
- Zaawansowane wyszukiwanie fiszek po słowach kluczowych lub filtrach.
- Wsparcie dla wielu języków interfejsu (na start tylko polski).
- Publicznie dostępne API.

## 5. Historyjki użytkowników

### Uwierzytelnianie i Zarządzanie Kontem

- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji przy użyciu mojego adresu e-mail i hasła, aby móc zapisywać i zarządzać moimi fiszkami do nauki hiszpańskiego.
- Kryteria akceptacji:
  - Formularz rejestracji zawiera pola na adres e-mail i hasło.
  - System waliduje poprawność formatu adresu e-mail.
  - Hasło musi spełniać podstawowe wymagania bezpieczeństwa (minimalna długość 8 znaków).
  - Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany na stronę główną.
  - W przypadku błędu (np. zajęty e-mail) wyświetlany jest czytelny komunikat.

- ID: US-002
- Tytuł: Logowanie do aplikacji
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na moje konto przy użyciu e-maila i hasła, aby uzyskać dostęp do moich fiszek.
- Kryteria akceptacji:
  - Formularz logowania zawiera pola na adres e-mail i hasło.
  - Po pomyślnym zalogowaniu użytkownik jest przekierowywany do głównego panelu aplikacji.
  - System przechowuje sesję użytkownika, aby nie musiał logować się przy każdej wizycie.
  - W przypadku podania błędnych danych logowania wyświetlany jest odpowiedni komunikat.

- ID: US-003
- Tytuł: Wylogowanie z aplikacji
- Opis: Jako zalogowany użytkownik, chcę mieć możliwość wylogowania się z aplikacji, aby zabezpieczyć swoje konto.
- Kryteria akceptacji:
  - W interfejsie użytkownika znajduje się widoczny przycisk "Wyloguj".
  - Po kliknięciu przycisku sesja użytkownika jest kończona.
  - Użytkownik jest przekierowywany na stronę główną lub stronę logowania.

### Zarządzanie Fiszkami

- ID: US-004
- Tytuł: Generowanie fiszek przez AI z tekstu hiszpańskiego
- Opis: Jako zalogowany użytkownik, chcę wkleić fragment tekstu w języku hiszpańskim do pola tekstowego i kliknąć przycisk "Generuj fiszki", aby system AI automatycznie stworzył dla mnie zestaw fiszek z najtrudniejszymi słówkami.
- Kryteria akceptacji:
  - Na stronie głównej znajduje się pole tekstowe (`textarea`) na maksymalnie 2000 znaków.
  - Dostępny jest dropdown do wyboru poziomu trudności (A2, B1, B2), z domyślnie wybranym B1.
  - Przycisk "Generuj" jest aktywny tylko, gdy pole tekstowe nie jest puste.
  - Po kliknięciu "Generuj" przycisk staje się nieaktywny, a na ekranie pojawia się wskaźnik ładowania.
  - Zapytanie do AI (OpenRouter) jest wysyłane z tekstem i wybranym poziomem trudności.
  - Po otrzymaniu odpowiedzi od AI, wskaźnik ładowania znika, a pod formularzem pojawia się lista propozycji fiszek.
  - Każda wygenerowana fiszka ma format: Front (ES słowo), Back (PL tłumaczenie + część mowy).

- ID: US-005
- Tytuł: Obsługa błędów podczas generowania fiszek
- Opis: Jako użytkownik, w przypadku problemu z generowaniem fiszek (np. błąd sieci, błąd API), chcę otrzymać jasny komunikat o błędzie.
- Kryteria akceptacji:
  - Jeśli API zwróci błąd lub odpowiedź nie jest w formacie JSON, wskaźnik ładowania znika.
  - Na ekranie pojawia się komunikat Toast informujący o problemie (np. "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie.").
  - Przycisk "Generuj" ponownie staje się aktywny.

- ID: US-006
- Tytuł: Przeglądanie, edycja i odrzucanie propozycji fiszek
- Opis: Jako użytkownik, chcę przejrzeć listę fiszek zaproponowanych przez AI, aby móc je edytować lub odrzucić te, których nie chcę dodawać do mojej kolekcji.
- Kryteria akceptacji:
  - Każda propozycja na liście wyświetla "Front", "Back" i "Część mowy".
  - Kliknięcie na tekst fiszki (front lub back) umożliwia jego edycję w miejscu (inline).
  - Przy każdej propozycji znajduje się przycisk "X", który usuwa ją z listy.
  - Główny przycisk "Dodaj fiszki" dynamicznie aktualizuje swoją etykietę, pokazując liczbę pozostałych na liście propozycji (np. "Dodaj 18 fiszek").

- ID: US-007
- Tytuł: Import zaakceptowanych fiszek
- Opis: Jako użytkownik, po przejrzeniu propozycji, chcę jednym kliknięciem dodać wszystkie zaakceptowane fiszki do mojej głównej bazy.
- Kryteria akceptacji:
  - Kliknięcie przycisku "Dodaj [X] fiszek" zapisuje wszystkie pozycje z listy do bazy danych Supabase.
  - Każda zapisana fiszka ma przypisany `user_id`, `leitner_box = 1`, `review_due_at = NOW()`, oraz `ai_generated = true`.
  - Po pomyślnym zapisie lista propozycji jest czyszczona, a użytkownik widzi komunikat Toast o sukcesie.
  - W przypadku błędu zapisu do bazy, użytkownik widzi komunikat o błędzie, a propozycje pozostają na liście.

- ID: US-008
- Tytuł: Manualne dodawanie fiszki
- Opis: Jako użytkownik, chcę mieć możliwość szybkiego dodania własnej fiszki, bez korzystania z AI.
- Kryteria akceptacji:
  - Na stronie głównej znajduje się przełącznik lub link do formularza manualnego ("Lub dodaj manualnie").
  - Formularz zawiera pola: "Front (ES)", "Tłumaczenie (PL)", "Część mowy (opcjonalnie)".
  - Przycisk "Zapisz" jest aktywny tylko, gdy pola "Front" i "Tłumaczenie" są wypełnione.
  - Po kliknięciu "Zapisz" fiszka jest dodawana do bazy z `leitner_box = 1`, `review_due_at = NOW()`, oraz `ai_generated = false`.
  - Formularz jest czyszczony, a użytkownik widzi komunikat Toast o pomyślnym dodaniu fiszki.

- ID: US-009
- Tytuł: Przeglądanie i zarządzanie moimi fiszkami
- Opis: Jako użytkownik, chcę mieć stronę, na której mogę zobaczyć wszystkie moje fiszki, edytować je lub usunąć.
- Kryteria akceptacji:
  - Strona "Moje Fiszki" wyświetla tabelę lub listę wszystkich fiszek zalogowanego użytkownika.
  - Każdy wiersz zawiera "Front", "Back", "Część mowy" oraz opcje edycji i usunięcia.
  - Edycja odbywa się w miejscu (inline).
  - Usunięcie fiszki wymaga potwierdzenia (np. w oknie modalnym).
  - Po usunięciu fiszka znika z listy i jest usuwana z bazy danych.

- ID: US-010
- Tytuł: Rozpoczynanie sesji powtórek
- Opis: Jako użytkownik, chcę rozpocząć sesję nauki, podczas której system zaprezentuje mi fiszki, które wymagają powtórki w danym dniu zgodnie z algorytmem Leitnera.
- Kryteria akceptacji:
  - W nawigacji znajduje się link "Ucz się".
  - Po kliknięciu system pobiera fiszki, dla których `review_due_at <= NOW()`, sortując je po `leitner_box` rosnąco.
  - Jeśli nie ma fiszek do powtórki, wyświetlany jest komunikat "Ukończyłeś sesję na dziś!".
  - Jeśli są fiszki, wyświetlany jest interfejs sesji z pierwszą fiszką.

- ID: US-011
- Tytuł: Przebieg sesji powtórek
- Opis: Jako użytkownik w trakcie sesji, chcę zobaczyć przód fiszki (słowo hiszpańskie), następnie odkryć odpowiedź (tłumaczenie polskie) i ocenić, czy ją znałem.
- Kryteria akceptacji:
  - Domyślnie widoczny jest tylko przód fiszki (Front - ES).
  - Przycisk "Pokaż odpowiedź" odsłania tył fiszki (Back - PL).
  - Po odsłonięciu odpowiedzi pojawiają się dwa przyciski: "Wiem" i "Nie wiem".
  - Kliknięcie "Nie wiem" aktualizuje fiszkę: `leitner_box = 1`, `review_due_at = NOW()`.
  - Kliknięcie "Wiem" aktualizuje fiszkę zgodnie z logiką:
    - Box 1 → 2: `leitner_box = 2`, `review_due_at = NOW() + 1 dzień`
    - Box 2 → 3: `leitner_box = 3`, `review_due_at = NOW() + 3 dni`
    - Box 3: pozostaje w Box 3, `review_due_at = NOW() + 3 dni`
  - Po ocenie system ładuje kolejną fiszkę do powtórki.
  - Sesja kontynuowana jest do momentu, aż nie będzie więcej kart do powtórzenia.
  - Na koniec wyświetlany jest ekran podsumowania z liczbą powtórzonych fiszek.

- ID: US-012
- Tytuł: Bezpieczny dostęp i autoryzacja
- Opis: Jako zalogowany użytkownik chcę mieć pewność, że moje fiszki nie są dostępne dla innych użytkowników, aby zachować prywatność i bezpieczeństwo danych.
- Kryteria akceptacji:
  - Tylko zalogowany użytkownik może wyświetlać, edytować i usuwać swoje fiszki.
  - Fiszki są pobierane z bazy danych z filtrem `user_id = [zalogowany_użytkownik]`.
  - Nie ma dostępu do fiszek innych użytkowników ani możliwości współdzielenia.

## 6. Metryki sukcesu
- Jakość generowania AI (Cel: >75%): Mierzone jako stosunek liczby fiszek zaakceptowanych (nieodrzuconych) do całkowitej liczby fiszek wygenerowanych przez AI. Formuła: `SUM(ai_proposal_accepted) / SUM(ai_proposal_generated) > 0.75`
- Adopcja funkcji AI (Cel: >50% aktywnych użytkowników): Mierzone jako procent aktywnych użytkowników (zalogowanych w ciągu ostatnich 14 dni), którzy wygenerowali i zapisali co najmniej jedną fiszkę przy użyciu AI. Formuła: `(Użytkownicy z fiszkami AI) / (Aktywni użytkownicy) > 0.5`
- Regularność nauki: Procent użytkowników, którzy ukończyli przynajmniej jedną sesję nauki w ciągu ostatnich 7 dni. Cel: >40%
- Koszty operacyjne LLM: Regularne monitorowanie kosztów zużycia API OpenRouter w celu zapewnienia rentowności i skalowalności projektu.
- Wydajność systemu: Śledzenie kluczowych wskaźników wydajności, takich jak średni czas odpowiedzi serwera podczas generowania fiszek (cel: <3 sekundy) oraz ogólna stabilność aplikacji.
