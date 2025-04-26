# Plan Testów Aplikacji toADHDo

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji **toADHDo**, webowej aplikacji do zarządzania zadaniami, wykorzystującej nowoczesny stos technologiczny oparty o Astro, React, Tailwind CSS, Shadcn/ui oraz Supabase jako backend i Openrouter.ai do integracji AI. Plan obejmuje strategię, zakres, zasoby i harmonogram działań testowych mających na celu zapewnienie jakości, stabilności i bezpieczeństwa aplikacji.

### 1.2. Cele Testowania

Główne cele procesu testowania to:

*   Weryfikacja zgodności funkcjonalności aplikacji z wymaganiami.
*   Identyfikacja i raportowanie defektów.
*   Zapewnienie stabilności i wydajności aplikacji pod oczekiwanym obciążeniem.
*   Weryfikacja bezpieczeństwa aplikacji, w szczególności mechanizmów uwierzytelniania i autoryzacji.
*   Ocena użyteczności i spójności interfejsu użytkownika.
*   Potwierdzenie poprawnej integracji z usługami zewnętrznymi (Supabase, Openrouter.ai).
*   Zapewnienie, że aplikacja działa poprawnie w docelowych środowiskach.

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami

*   **Uwierzytelnianie Użytkownika:**
    *   Rejestracja nowego użytkownika.
    *   Logowanie istniejącego użytkownika.
    *   Wylogowywanie.
    *   Obsługa sesji użytkownika (middleware).
    *   (Opcjonalnie) Przypominanie/resetowanie hasła (`forgot-password.astro`).
*   **Zarządzanie Zadaniami (CRUD):**
    *   Tworzenie nowych zadań (formularz, modal, API).
    *   Wyświetlanie listy zadań (tabela, paginacja).
    *   Aktualizacja istniejących zadań (edycja w miejscu lub przez modal/formularz, API).
    *   Usuwanie zadań (potwierdzenie, API).
    *   Zmiana statusu, priorytetu, kategorii zadań.
    *   Sortowanie i filtrowanie zadań w tabeli.
    *   Ustalanie kolejności zadań (z wykorzystaniem algorytmu LexoRank).
*   **Zarządzanie kontekstem użytkownika:**
    *   Dodawanie i edycja kontekstu - preferencji - użytkownika, które personalizują wygenerowane zadania.
*   **Integracja z AI:**
    *   Generowanie opisu zadania przy użyciu Openrouter.ai.
    *   Obsługa stanów (ładowanie, błąd) podczas komunikacji z AI.
*   **Interfejs Użytkownika (UI):**
    *   Wyświetlanie stron (Astro).
    *   Działanie interaktywnych komponentów React (`LoginForm`, `RegisterForm`, `TaskTableContainer`, `ModalDialog`, etc.).
    *   Spójność wizualna (Tailwind, Shadcn/ui).
    *   Responsywność interfejsu na różnych urządzeniach (jeśli dotyczy).
    *   Obsługa powiadomień (`sonner.tsx`).
*   **API Endpoints:**
    *   Walidacja danych wejściowych.
    *   Obsługa błędów i zwracane kody statusu HTTP.
    *   Autoryzacja dostępu (zgodność z RLS Supabase).
    *   Poprawność zwracanych danych.

### 2.2. Funkcjonalności wyłączone z testów (jeśli dotyczy)

*   Testowanie wewnętrznej implementacji bibliotek Shadcn/ui (zakładamy ich poprawność).
*   Testowanie wewnętrznej funkcjonalności usług Supabase i Openrouter.ai (skupiamy się na integracji).
*   Testy obciążeniowe wykraczające poza symulację standardowego użytkowania (wymagałyby osobnego planu i narzędzi).

## 3. Typy Testów do Przeprowadzenia

*   **Testy Jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja poprawności działania izolowanych fragmentów kodu (funkcje pomocnicze, komponenty React, usługi).
    *   **Zakres:** Funkcje w `src/lib/utils.ts`, `lexorank-utils.ts`, logika komponentów React (`*.tsx` w `src/components/`), usługi (`authService.ts`, `openrouter.service.ts`), logika endpointów API (po wyizolowaniu od frameworka Astro i Supabase).
    *   **Narzędzia:** Vitest, React Testing Library (RTL).
    *   **Uwagi:** Mockowanie zależności (np. Supabase client, Openrouter API).
*   **Testy End-to-End (E2E Tests):**
    *   **Cel:** Symulacja rzeczywistych scenariuszy użytkowania aplikacji z perspektywy użytkownika końcowego, weryfikacja przepływów pracy w całej aplikacji.
    *   **Zakres:** Pełne scenariusze: rejestracja -> logowanie -> tworzenie zadania -> edycja -> filtrowanie -> wylogowanie. Weryfikacja działania w przeglądarce, w tym interakcje UI, routing, komunikacja z API i bazą danych (może być testowa instancja Supabase).
    *   **Narzędzia:** Playwright (preferowany ze względu na wsparcie dla nowoczesnych frameworków).
*   **Testy API:**
    *   **Cel:** Bezpośrednia weryfikacja funkcjonalności, niezawodności i bezpieczeństwa endpointów API (`src/pages/api/*`).
    *   **Zakres:** Testowanie każdego endpointu pod kątem poprawnych żądań, obsługi błędów, walidacji danych, autoryzacji, zwracanych odpowiedzi.
    *   **Narzędzia:** Narzędzia do testowania API (np. Postman, Insomnia) lub biblioteki do testów HTTP w kodzie (np. Supertest w ramach testów integracyjnych/E2E).

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

(Przykładowe scenariusze - do rozwinięcia)

*   **Scenariusz 1: Pomyślna rejestracja i logowanie użytkownika**
    1.  Przejdź do strony rejestracji (`/register`).
    2.  Wypełnij formularz poprawnymi danymi (email, hasło).
    3.  Kliknij przycisk "Zarejestruj się".
    4.  **Oczekiwany rezultat:** Użytkownik zostaje przekierowany (np. na stronę logowania lub zadań) i pojawia się komunikat o sukcesie. W bazie danych Supabase pojawia się nowy użytkownik.
    5.  Przejdź do strony logowania (`/login`).
    6.  Wprowadź dane zarejestrowanego użytkownika.
    7.  Kliknij przycisk "Zaloguj się".
    8.  **Oczekiwany rezultat:** Użytkownik zostaje przekierowany na stronę zadań (`/tasks`). Interfejs wskazuje zalogowanego użytkownika.
*   **Scenariusz 2: Tworzenie nowego zadania**
    1.  Będąc zalogowanym, przejdź do strony zadań (`/tasks`).
    2.  Kliknij przycisk "Dodaj zadanie" (lub analogiczny).
    3.  Wypełnij formularz tworzenia zadania (tytuł, opis, priorytet itp.).
    4.  Kliknij przycisk "Zapisz".
    5.  **Oczekiwany rezultat:** Modal/formularz zostaje zamknięty. Nowe zadanie pojawia się na liście zadań z wprowadzonymi danymi. Zadanie jest zapisane w bazie danych Supabase.
*   **Scenariusz 3: Nieudane logowanie (błędne hasło)**
    1.  Przejdź do strony logowania (`/login`).
    2.  Wprowadź poprawny email zarejestrowanego użytkownika i błędne hasło.
    3.  Kliknij przycisk "Zaloguj się".
    4.  **Oczekiwany rezultat:** Użytkownik pozostaje na stronie logowania. Pojawia się czytelny komunikat o błędzie (np. "Nieprawidłowy email lub hasło").
*   **Scenariusz 4: Generowanie opisu zadania przez AI**
    1.  Podczas tworzenia lub edycji zadania, kliknij przycisk "Generuj opis AI" (lub analogiczny).
    2.  **Oczekiwany rezultat (sukces):** Po chwili ładowania, pole opisu zostaje wypełnione tekstem wygenerowanym przez AI.
    3.  **Oczekiwany rezultat (błąd):** W przypadku problemu z usługą AI, pojawia się czytelny komunikat o błędzie.
*   **Scenariusz 5: Dostęp nieautoryzowany do API zadań**
    1.  Wykonaj żądanie API (np. GET do `/api/tasks`) bez ważnego tokenu sesji.
    2.  **Oczekiwany rezultat:** API zwraca błąd autoryzacji (np. status 401 Unauthorized) i nie zwraca żadnych danych zadań.
*   **Scenariusz 6: Edycja zadania**
    1.  Będąc zalogowanym, na stronie `/tasks`, znajdź istniejące zadanie.
    2.  Użyj akcji w wierszu (np. przycisk "Edytuj" w `TaskRowActions.tsx`).
    3.  Zmodyfikuj dane zadania w formularzu/modalu.
    4.  Zapisz zmiany.
    5.  **Oczekiwany rezultat:** Zmodyfikowane dane są widoczne w tabeli zadań i zapisane w bazie danych.

## 5. Środowisko Testowe

*   **Środowisko Deweloperskie:** Lokalne maszyny deweloperów (do testów jednostkowych i integracyjnych podczas rozwoju).
*   **Środowisko Testowe (Staging):** Dedykowana instancja aplikacji wdrożona na infrastrukturze zbliżonej do produkcyjnej (np. osobny projekt Supabase, osobna instancja aplikacji na DigitalOcean). Używane do testów E2E, API, Użyteczności, Wizualnych przed wdrożeniem na produkcję.
*   **Środowisko Produkcyjne:** Ograniczone testy typu "smoke test" po wdrożeniu nowej wersji.
*   **Przeglądarki:** Najnowsze wersje Chrome.
*   **Baza Danych:** Dedykowana instancja Supabase dla środowiska testowego (Staging), z możliwością łatwego resetowania danych.

## 6. Narzędzia do Testowania

*   **Test Runner / Framework:** Vitest (dla testów jednostkowych i integracyjnych React/JS/TS).
*   **Biblioteka do Testowania Komponentów:** React Testing Library (RTL).
*   **Framework E2E:** Playwright.
*   **Testowanie API:** Postman/Insomnia (manualne i automatyzacja), Supertest (w kodzie).
*   **Mockowanie:** Vitest `vi.mock`, `msw` (Mock Service Worker) do mockowania API/Supabase w testach frontendowych.
*   **System Kontroli Wersji:** Git / GitHub (do zarządzania kodem testów i powiązania z kodem aplikacji).
*   **CI/CD:** GitHub Actions (do automatycznego uruchamiania testów).
*   **Zarządzanie Testami / Raportowanie Błędów:** GitHub Issues (lub inne używane w projekcie).

## 7. Harmonogram Testów

Harmonogram testów powinien być zintegrowany z cyklem rozwoju oprogramowania (np. sprintami w metodyce Agile).

*   **Testy Jednostkowe i Integracyjne:** Przeprowadzane ciągle przez deweloperów podczas kodowania oraz automatycznie w pipeline CI/CD przy każdym pushu/merge'u.
*   **Testy API:** Rozwijane równolegle z implementacją API, uruchamiane w CI/CD.
*   **Testy E2E:** Tworzone i aktualizowane dla kluczowych przepływów po stabilizacji funkcjonalności. Uruchamiane regularnie (np. codziennie w nocy) na środowisku Staging oraz przed każdym wdrożeniem na produkcję.
*   **Testy Manualne (Użyteczność, Eksploracyjne):** Przeprowadzane przed planowanym wydaniem na środowisku Staging.
*   **Testy Regresji:** Automatyczne (Jednostkowe, Integracyjne, E2E) i manualne (dla krytycznych obszarów) przeprowadzane przed każdym wydaniem.
*   **Testy Bezpieczeństwa:** Okresowo, zwłaszcza po zmianach w modułach uwierzytelniania/autoryzacji lub API.

Konkretne daty i czas trwania faz testowych będą ustalane w ramach planowania sprintów/wydań.

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria Wejścia (Rozpoczęcia Testów)

*   Dostępna dokumentacja (jeśli istnieje) opisująca testowane funkcjonalności.
*   Przygotowane środowisko testowe i dane testowe.

### 8.2. Kryteria Wyjścia (Zakończenia Testów)

*   Wszystkie zaplanowane testy (automatyczne i manualne) zostały wykonane.
*   Osiągnięty zdefiniowany poziom pokrycia kodu testami (np. 80% dla testów jednostkowych/integracyjnych - do ustalenia).
*   Wszystkie krytyczne i wysokie błędy zostały naprawione i zweryfikowane.
*   Liczba i priorytet pozostałych otwartych błędów jest akceptowalna przez interesariuszy projektu (Product Owner, Tech Lead).
*   Raport z testów został przygotowany i zaakceptowany.