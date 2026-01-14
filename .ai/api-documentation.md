# API Documentation - 10xCards

## Endpoints

### Authentication

#### POST `/api/auth/register`
Rejestracja nowego użytkownika.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {...}
}
```

**Response (400):**
```json
{
  "error": "Email already registered"
}
```

---

#### POST `/api/auth/login`
Logowanie użytkownika.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {...}
}
```

**Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

#### POST `/api/auth/logout`
Wylogowanie użytkownika.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Flashcards - AI Generation

#### POST `/api/flashcards/generate`
Generowanie fiszek przez AI z tekstu hiszpańskiego.

**Request Body:**
```json
{
  "text": "El perro corre en el parque...",
  "level": "B1"
}
```

**Parameters:**
- `text` (string, required): Tekst w języku hiszpańskim (max 2000 znaków)
- `level` (string, optional): Poziom trudności - "A2", "B1", "B2" (default: "B1")

**Response (200):**
```json
{
  "flashcards": [
    {
      "front": "correr",
      "back": "biegać (czasownik)",
      "part_of_speech": "czasownik"
    },
    {
      "front": "parque",
      "back": "park (rzeczownik)",
      "part_of_speech": "rzeczownik"
    }
  ]
}
```

**Response (400):**
```json
{
  "error": "Text too long (max 2000 characters)"
}
```

**Response (500):**
```json
{
  "error": "Failed to generate flashcards"
}
```

---

### Flashcards - CRUD Operations

#### GET `/api/flashcards`
Pobranie wszystkich fiszek użytkownika.

**Response (200):**
```json
{
  "flashcards": [
    {
      "id": "uuid",
      "front": "palabra",
      "back": "słowo (rzeczownik)",
      "part_of_speech": "rzeczownik",
      "leitner_box": 2,
      "review_due_at": "2026-01-15T10:00:00Z",
      "ai_generated": true,
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:00:00Z"
    }
  ]
}
```

---

#### POST `/api/flashcards`
Dodanie nowej fiszki (pojedynczo - bulk add używa innego endpointa).

**Request Body:**
```json
{
  "front": "libro",
  "back": "książka (rzeczownik)",
  "part_of_speech": "rzeczownik",
  "ai_generated": false
}
```

**Response (201):**
```json
{
  "flashcard": {
    "id": "uuid",
    "front": "libro",
    "back": "książka (rzeczownik)",
    "part_of_speech": "rzeczownik",
    "leitner_box": 1,
    "review_due_at": "2026-01-14T10:00:00Z",
    "ai_generated": false,
    "created_at": "2026-01-14T10:00:00Z",
    "updated_at": "2026-01-14T10:00:00Z"
  }
}
```

---

#### POST `/api/flashcards/bulk`
Dodanie wielu fiszek naraz (po zaakceptowaniu propozycji AI).

**Request Body:**
```json
{
  "flashcards": [
    {
      "front": "casa",
      "back": "dom (rzeczownik)",
      "part_of_speech": "rzeczownik",
      "ai_generated": true
    },
    {
      "front": "grande",
      "back": "duży (przymiotnik)",
      "part_of_speech": "przymiotnik",
      "ai_generated": true
    }
  ]
}
```

**Response (201):**
```json
{
  "count": 2,
  "flashcards": [...]
}
```

---

#### PATCH `/api/flashcards/:id`
Aktualizacja fiszki.

**Request Body:**
```json
{
  "front": "casa grande",
  "back": "duży dom (fraza)",
  "part_of_speech": "fraza"
}
```

**Response (200):**
```json
{
  "flashcard": {...}
}
```

**Response (404):**
```json
{
  "error": "Flashcard not found"
}
```

---

#### DELETE `/api/flashcards/:id`
Usunięcie fiszki.

**Response (200):**
```json
{
  "message": "Flashcard deleted successfully"
}
```

**Response (404):**
```json
{
  "error": "Flashcard not found"
}
```

---

### Learning Session

#### GET `/api/flashcards/review`
Pobranie fiszek do powtórki (sesja nauki).

**Response (200):**
```json
{
  "flashcards": [
    {
      "id": "uuid",
      "front": "palabra",
      "back": "słowo (rzeczownik)",
      "part_of_speech": "rzeczownik",
      "leitner_box": 1
    }
  ],
  "count": 15
}
```

---

#### PATCH `/api/flashcards/:id/review`
Aktualizacja fiszki po ocenie w sesji nauki.

**Request Body:**
```json
{
  "result": "correct"
}
```

**Parameters:**
- `result` (string, required): "correct" lub "incorrect"

**Response (200):**
```json
{
  "flashcard": {
    "id": "uuid",
    "leitner_box": 2,
    "review_due_at": "2026-01-15T10:00:00Z"
  }
}
```

**Logic:**
- `result: "incorrect"` → leitner_box = 1, review_due_at = NOW()
- `result: "correct"` && box 1 → leitner_box = 2, review_due_at = NOW() + 1 day
- `result: "correct"` && box 2 → leitner_box = 3, review_due_at = NOW() + 3 days
- `result: "correct"` && box 3 → leitner_box = 3, review_due_at = NOW() + 3 days

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

All endpoints (except `/api/auth/*`) require authentication via Supabase session cookie or Authorization header.

**Header:**
```
Authorization: Bearer <supabase-jwt-token>
```

---

## Rate Limiting

To prevent abuse of the AI generation endpoint:
- `/api/flashcards/generate`: Max 10 requests per minute per user
- Other endpoints: Max 100 requests per minute per user

