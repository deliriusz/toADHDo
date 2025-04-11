# API Endpoint Implementation Plan: Tasks Endpoint

## 1. Przegląd punktu końcowego
Endpoint służy do zarządzania zadaniami przypisanymi do uwierzytelnionego użytkownika. Umożliwia tworzenie, odczytywanie, aktualizację oraz usuwanie zadań, operując na tabeli `task` w bazie danych. Endpoint integruje mechanizmy paginacji, filtrowania, sortowania oraz walidacji danych, zapewniając bezpieczny dostęp dzięki mechanizmowi RLS oraz uwierzytelnianiu przez Supabase.

## 2. Szczegóły żądania
### GET /api/tasks
- **Opis**: Pobranie paginowanej listy zadań.
- **Parametry zapytania**:
  - `page` (wymagane): Numer strony.
  - `limit` (wymagane): Liczba elementów na stronę.
  - `sort_by` (wymagane): Pole sortowania (np. `created_at`, `priority`).
  - `order` (wymagane): Kolejność sortowania (`asc` lub `desc`).
  - `filter[category]` (opcjonalne): Filtr według kategorii.
  - `filter[completed]` (opcjonalne): Filtr według statusu ukończenia.

### POST /api/tasks
- **Opis**: Utworzenie nowego zadania.
- **Request Body (JSON)**:
  ```json
  {
    "priority": 1,
    "category": "A",
    "task_source": "full-ai",
    "description": "Task description..."
  }
  ```

### GET /api/tasks/{id}
- **Opis**: Pobranie szczegółów konkretnego zadania.
- **Parametry URL**:
  - `id`: Identifikator zadania.

### PATCH /api/tasks/{id}
- **Opis**: Aktualizacja istniejącego zadania.
- **Request Body (JSON)**: Wszystkie pola są opcjonalne, np.
  ```json
  {
    "priority": 2,
    "category": "B",
    "task_source": "edited-ai",
    "description": "Updated description...",
    "completed_at": "2023-10-21T15:00:00Z"
  }
  ```

### DELETE /api/tasks/{id}
- **Opis**: Usunięcie zadania. Nie wymaga ciała żądania.

## 3. Wykorzystywane typy
- **TaskDTO**: Reprezentacja zadania po stronie bazy danych.
- **CreateTaskCommand**: Model danych używany przy tworzeniu zadania; modyfikuje pole `category` na typ `TaskCategory` (`A`, `B`, `C`).
- **UpdateTaskCommand**: Model do aktualizacji zadania z opcjonalnymi polami umożliwiający modyfikację `priority`, `category`, `task_source`, `description` oraz `completed_at`.
- **PaginatedResponse<TaskDTO>**: Generyczny typ odpowiedzi dla operacji paginacji.

## 4. Szczegóły odpowiedzi
- **GET /api/tasks**: Zwraca 200 OK wraz z listą zadań i metadanymi (total, page, limit).
- **POST /api/tasks**: Zwraca 201 Created z nowo utworzonym obiektem zadania.
- **GET /api/tasks/{id}**: Zwraca 200 OK z detalami zadania lub 404 Not Found, jeśli zadanie nie istnieje.
- **PATCH /api/tasks/{id}**: Zwraca 200 OK z obiektem zaktualizowanego zadania lub właściwy komunikat błędu.
- **DELETE /api/tasks/{id}**: Zwraca 204 No Content przy pomyślnym usunięciu zadania.

## 5. Przepływ danych
1. Żądanie trafia do odpowiedniego handlera endpointu.
2. Walidacja danych wejściowych odbywa się przy użyciu biblioteki zod.
3. Warstwa serwisowa, znajdująca się w katalogu `src/lib/services`, przetwarza dane wejściowe:
   - Dla POST: mapuje dane wejściowe do modelu `CreateTaskCommand`, dokonując transformacji (np. konwersja `category` z uppercase na lowercase przed zapisem do DB).
   - Dla PATCH: mapuje dane na `UpdateTaskCommand` i aktualizuje odpowiednie pola w bazie.
4. Operacje na bazie danych są realizowane przez klienta Supabase z uwzględnieniem RLS (weryfikacja `user_id`).
5. Wynik operacji (sukces lub błąd) jest przesyłany w odpowiedzi HTTP z odpowiednim kodem statusu.

## 6. Względy bezpieczeństwa
- **Autoryzacja/Uwierzytelnianie**: Wszystkie żądania muszą być wykonywane przez uwierzytelnionych użytkowników. Klient Supabase wykorzystuje mechanizmy autoryzacji.
- **Row-Level Security (RLS)**: Każde zapytanie operujące na tabeli `task` musi uwzględniać filtr `user_id`, zgodny z bieżącym użytkownikiem (polityka RLS w bazie danych).
- **Walidacja i Sanityzacja danych**: Użycie zod zapewnia, że dane wejściowe są poprawne oraz odpowiednio formatowane, zmniejszając ryzyko ataków typu SQL Injection.

## 7. Obsługa błędów
- **400 Bad Request**: Gdy dane wejściowe są nieprawidłowe lub brakuje wymaganych pól.
- **401 Unauthorized**: Gdy użytkownik nie jest autoryzowany.
- **404 Not Found**: Gdy żądane zadanie nie istnieje.
- **500 Internal Server Error**: W przypadku nieoczekiwanych błędów serwerowych.
- **Logowanie błędów**: Wdrożenie mechanizmu logowania błędów, np. zapisywanie wpisów w tabeli `processing_log` lub korzystanie z zewnętrznych narzędzi monitorujących.

## 8. Rozważania dotyczące wydajności
- **Indeksy**: Użycie indeksów na kolumnie `user_id` w tabeli `task` usprawnia filtrowanie wyników.
- **Paginacja**: Ogranicza liczbę zwracanych rekordów, minimalizując obciążenie bazy.
- **Optymalizacja zapytań**: Wykonywanie zapytań SQL przy użyciu efektywnych mechanizmów Supabase oraz przemyślane filtrowanie.
- **Cache'owanie (opcjonalnie)**: Możliwość implementacji cache'owania dla najczęściej wykonywanych zapytań.

## 9. Etapy wdrożenia
1. **Tworzenie szkieletu endpointów**: Utworzenie plików obsługujących poszczególne metody HTTP w katalogu `src/pages/api/tasks`.
2. **Walidacja danych**: Implementacja walidacji danych wejściowych przy użyciu zod w każdej metodzie endpointu.
3. **Implementacja logiki biznesowej**: Wyodrębnienie logiki operacji na zadaniach do warstwy serwisowej w `src/lib/services`.
4. **Integracja z bazą danych**: Wykorzystanie klienta Supabase do komunikacji z bazą, uwzględniając RLS i indeksy.
5. **Obsługa transformacji danych**: Mapowanie danych wejściowych do modeli `CreateTaskCommand` i `UpdateTaskCommand` oraz odpowiednia konwersja pól (np. `category`).
6. **Logowanie i monitorowanie błędów**: Wdrożenie mechanizmu logowania błędów, aby ułatwić diagnostykę problemów.
7. **Testowanie jednostkowe i integracyjne**: Opracowanie testów dla wszystkich endpointów oraz funkcji warstwy serwisowej.
8. **Przegląd bezpieczeństwa**: Weryfikacja mechanizmów autoryzacji, walidacji oraz RLS pod kątem zagrożeń bezpieczeństwa.
9. **Wdrożenie i monitorowanie**: Ostateczne wdrożenie endpointów oraz monitorowanie wydajności i stabilności systemu. 