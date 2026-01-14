# MVP - 10xCards (Nauka Języka Hiszpańskiego)

## Główny problem
Manualne tworzenie wysokiej jakości fiszek do nauki języka hiszpańskiego jest czasochłonne i monotonne, co zniechęca do korzystania z efektywnej metody nauki jaką jest spaced repetition.

## Najmniejszy zestaw funkcjonalności

### 1. Uwierzytelnianie
- Prosty system rejestracji i logowania (e-mail + hasło) przez Supabase
- Bez weryfikacji e-mail w MVP
- Automatyczne logowanie po rejestracji

### 2. Generowanie Fiszek przez AI
- Pole tekstowe do wklejania tekstu w języku hiszpańskim (limit 2000 znaków)
- Wybór poziomu trudności: A2, B1, B2 (domyślnie B1)
- Zapytanie do OpenRouter.ai (modele Haiku/Mistral)
- AI zwraca do 20 fiszek w formacie JSON: `{"fiszki": [{"front": "ES", "back": "PL (część mowy)"}, ...]}`
- Wskaźnik ładowania podczas generowania

### 3. Przegląd i Import Fiszek
- Lista wygenerowanych propozycji fiszek
- Edycja inline (front, back, część mowy)
- Odrzucanie niechcianych propozycji (przycisk X)
- Przycisk "Dodaj [X] fiszek" - zapisuje do bazy z `leitner_box = 1` i `review_due_at = NOW()`

### 4. Manualne Tworzenie Fiszek
- Formularz z polami: "Front (ES)", "Tłumaczenie (PL)", "Część mowy (opcjonalnie)"
- Bezpośredni zapis do bazy danych

### 5. Zarządzanie Fiszkami (CRUD)
- Strona "Moje Fiszki" z listą wszystkich fiszek użytkownika
- Edycja inline
- Usuwanie z potwierdzeniem

### 6. System Powtórek (Leitner - 3 pudełka)
- Sesja nauki: `WHERE review_due_at <= NOW() ORDER BY leitner_box ASC`
- UI: Pokazuje Front (ES) → Użytkownik klika "Pokaż odpowiedź" → Widzi Back (PL)
- Ocena: "Wiem" lub "Nie wiem"
- Logika aktualizacji:
  - **"Nie wiem"**: Box → 1, review_due_at = NOW()
  - **"Wiem"** (Box 1 → 2): Box → 2, review_due_at = NOW() + 1 dzień
  - **"Wiem"** (Box 2 → 3): Box → 3, review_due_at = NOW() + 3 dni
- Ekran podsumowania po zakończeniu sesji

### 7. Obsługa Błędów
- Komunikaty Toast dla błędów API i bazy danych

## Co NIE wchodzi w zakres MVP
- Zaawansowane algorytmy powtórek (więcej niż 3 pudełka Leitnera)
- Import plików (PDF, DOCX, URL)
- Wiele talii fiszek (wszystkie w jednej bazie)
- Współdzielenie fiszek między użytkownikami
- Integracje z platformami edukacyjnymi
- Aplikacje mobilne (tylko web)
- Gamifikacja
- Powiadomienia push
- Zaawansowane wyszukiwanie i filtry
- Wsparcie dla wielu języków interfejsu
- Weryfikacja e-mail

## Kryteria sukcesu MVP
- **75%** fiszek wygenerowanych przez AI jest akceptowanych (nie-odrzuconych)
- **50%** aktywnych użytkowników skorzystało z generowania AI
- **40%** użytkowników ukończyło sesję nauki w ciągu ostatnich 7 dni
- Średni czas generowania fiszek: **<3 sekundy**
