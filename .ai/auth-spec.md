# Specyfikacja modułu autoryzacji (Rejestracja, Logowanie)

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Strony i layouty Astro
- Dodaj dwa nowe layouty w `src/layouts`:
  - `AuthLayout.astro`: wykorzystywany we wszystkich stronach związanych z autentykacją (rejestracja, logowanie). Zawiera wspólną strukturę: nagłówek, slot na formularz, stopkę.
  - `MainLayout.astro`: istniejący layout rozszerzony o nawigację chronioną sesją (linki do listy zadań, profilu, wylogowania).

### 1.2 Strony Astro
- `src/pages/register.astro`  
- `src/pages/login.astro`  

Każda strona używa `AuthLayout.astro` i importuje odpowiedni komponent React do obsługi formularza.

### 1.3 Komponenty React w `src/components/auth`
- `RegisterForm.tsx`  
- `LoginForm.tsx`  

Każdy komponent:
- Wykorzystuje React Hook Form + Zod do walidacji po stronie klienta.
- Na submit wywołuje fetch do odpowiednich endpointów API (`/api/auth/...`).
- Obsługuje stany ładowania, błędów walidacyjnych oraz odpowiedzi serwera.

### 1.4 Walidacja i komunikaty błędów
- Pola formularzy:
  - email: wymagane, format e-mail (regex).
  - password: wymagane, min. 8 znaków, conajmniej 1 duża litera i 1 cyfra.
  - password confirmation (w rejestracji): zgodność z polem password.
- Błędy walidacyjne wyświetlane lokalnie pod polem.
- Błędy serwera (np. istnienie konta, niepoprawne hasło) jako alert z komponentu Shadcn/UI (`<Alert>`).
- Jednolity komunikat globalny dla nieoczekiwanych błędów: "Coś poszło nie tak, spróbuj ponownie później".

### 1.5 Scenariusze użytkownika
1. Rejestracja: wypełnienie `RegisterForm` → walidacja → POST `/api/auth/register` → przekierowanie do `/login` z komunikatem success.
2. Logowanie: `LoginForm` → walidacja → POST `/api/auth/login` → zapis sesji przez Supabase → redirect do `/tasks`.

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów API w `src/pages/api/auth`
- `register.ts`      - rejestracja
- `login.ts`         - logowanie
- `logout.ts`        - wylogowanie

Każdy endpoint:
- Przyjmuje metodę POST.
- Parsuje i waliduje ciało przy pomocy Zod.
- Oddelegowuje logikę do `src/lib/services/authService.ts`.
- Zwraca ujednolicone odpowiedzi JSON:
  ```ts
  interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: { code: string; message: string };
  }
  ```

### 2.2 Modele i DTO w `src/types.ts`
```ts
export interface RegisterDto { email: string; password: string; fullName?: string; }
export interface LoginDto    { email: string; password: string; }
```

### 2.3 Walidacja i obsługa wyjątków
- Użycie Zod w każdej definicji endpointu.
- Guard clauses: weryfikacja inputu → zwrot 400 przy błędzie.
- Obsługa błędów Supabase (np. błędny token, istniejące konto) → mapowanie na kod i wiadomość w `error`.
- Logowanie wyjątków w konsoli lub dedykowanym loggerze.

### 2.4 Middleware i SSR w Astro
- `src/middleware/index.ts`:
  - Funkcja run przed renderingiem stron.
  - Odczyt cookie Supabase Auth (HttpOnly).
  - Jeśli użytkownik niezalogowany i strona chroniona (pattern `/tasks` i inne) → redirect `/login`.
  - Jeśli użytkownik zalogowany i ścieżka auth (`/login`, `/register`) → redirect `/tasks`.

Konfiguracja w `astro.config.mjs` pozostaje bez zmian (adapter Node, server-side).  

## 3. SYSTEM AUTENTYKACJI

### 3.1 Integracja z Supabase Auth
- Klient Supabase jest konfigurowany w pliku `src/db/supabase.client.ts`:
  ```ts
  import { createClient } from '@supabase/supabase-js';
  import type { Database } from './database.types';
  
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_KEY;
  
  export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  export type SupabaseClient = typeof supabaseClient;
  ```
- W usługach backendowych (np. `src/lib/services/authService.ts`) importujemy `supabaseClient` z `src/db/supabase.client.ts` do operacji wymagających bezpośredniego dostępu do Supabase.
- W trasach API Astro (`src/pages/api/auth/*`) korzystamy z instancji Supabase dostępnej w `context.locals.supabase`, typowanej jako `SupabaseClient`.

### 3.2 Konfiguracja klienta Supabase w `src/db/supabase.client.ts`
```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from 'src/db/database.types.ts';
const supabaseUrl = import.meta.env.SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY!;
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type SupabaseClient = typeof supabaseClient;
```

### 3.3 Zarządzanie sesją
- Supabase automatycznie zapisuje tokeny w cookies HttpOnly.
- W middleware Astro (`src/middleware/index.ts`) używać `context.locals.supabase.auth.getSession()` do odczytu stanu sesji.
- Client-side: opcjonalnie hook `useSession` z `@supabase/auth-helpers-react`.

### 3.4 Wylogowanie
- Endpoint `logout.ts` wywołuje `supabase.auth.signOut()` i usuwa cookie.
- Komponent `LogoutButton.tsx` w `src/components/ui` wywołuje fetch POST `/api/auth/logout`, a następnie `window.location.href = '/login'`.

### 3.5 Kontrakt komunikacji i statusy HTTP
- 200: sukces i walidacja
- 400: walidacja inputu
- 401: błędne poświadczenia, brak sesji
- Treść odpowiedzi: zgodna z `ApiResponse<T>`
- Wszystkie endpointy są SSR (brak CORS między frontendem a API).