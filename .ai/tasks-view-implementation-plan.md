# Plan implementacji widoku listy zadań (/tasks)

## 1. Przegląd
Widok listy zadań (`/tasks`) jest głównym interfejsem aplikacji `toADHDo`, umożliwiającym użytkownikom przeglądanie, filtrowanie, sortowanie i zarządzanie swoimi zadaniami. Wyświetla zadania w formie tabeli z paginacją, oferując akcje na poziomie wiersza (edycja, duplikacja, usuwanie, zmiana statusu, kategorii, priorytetu) oraz filtrowanie według opisu, statusu i kategorii.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/tasks`. Dostęp do tej ścieżki wymaga autoryzacji użytkownika. Niezalogowani użytkownicy powinni być przekierowywani do widoku logowania (`/login`).

## 3. Struktura komponentów
```
TaskListPage (Astro, /tasks)
└── TaskTableContainer (React, client:load)
    ├── TaskTableToolbar (React) // Połączone filtry i ew. akcje zbiorcze
    │   ├── Input (Shadcn - Filtr tekstowy)
    │   ├── TaskStatusFilter (React + Shadcn Combobox/Select)
    │   └── TaskCategoryFilter (React + Shadcn Combobox)
    │   └── (Opcjonalnie) BulkActions (React + Shadcn Button/Dropdown - np. Usuń zaznaczone)
    └── TaskDataTable (React, uses TanStack Table)
        ├── Table (Shadcn)
        │   ├── TableHeader (Shadcn)
        │   ├── TableBody (Shadcn)
        │   │   └── TableRow (Shadcn) per TaskDTO
        │   │       ├── TableCell (Shadcn - Bulk Checkbox) -> Checkbox (Shadcn)
        │   │       ├── TableCell (Shadcn - Description)
        │   │       ├── TableCell (Shadcn - Status) -> TaskStatusToggle (React + Shadcn Checkbox)
        │   │       ├── TableCell (Shadcn - Category) -> TaskCategoryToggle (React + Shadcn ToggleGroup)
        │   │       ├── TableCell (Shadcn - Priority) -> TaskPriorityControl (React + Shadcn Button)
        │   │       └── TableCell (Shadcn - Actions) -> TaskRowActions (React + Shadcn DropdownMenu)
        │   └── TableFooter (Shadcn)
        │       └── TaskTablePagination (React + Shadcn Button/Select)
        └── LoadingSpinner (React/Shadcn)
        └── ErrorDisplay (React)
```

## 4. Szczegóły komponentów

### `TaskListPage.astro`
- **Opis:** Strona Astro renderująca główny layout i osadzająca komponent React `TaskTableContainer`. Odpowiedzialna za ewentualne pobranie danych po stronie serwera (jeśli strategia SSR/ISR będzie wykorzystywana) lub zapewnienie routingu i layoutu.
- **Główne elementy:** Layout aplikacji, `<TaskTableContainer client:load />`.
- **Obsługiwane interakcje:** Brak bezpośrednich.
- **Obsługiwana walidacja:** Sprawdzenie autoryzacji użytkownika (globalnie przez middleware Astro lub na poziomie strony).
- **Typy:** Brak specyficznych.
- **Propsy:** Brak.

### `TaskTableContainer` (React)
- **Opis:** Główny kontener React zarządzający stanem tabeli (dane, filtry, paginacja, sortowanie, zaznaczenie), obsługujący logikę pobierania danych i mutacji (integracja z API) przy użyciu `TanStack Query` i `TanStack Table`.
- **Główne elementy:** `TaskTableToolbar`, `TaskDataTable`, `LoadingSpinner`, `ErrorDisplay`.
- **Obsługiwane interakcje:** Zarządzanie stanem filtrów, paginacji, sortowania; wywoływanie mutacji API (Create/Duplicate, Update, Delete) na podstawie zdarzeń z komponentów podrzędnych; obsługa zaznaczenia wierszy.
- **Obsługiwana walidacja:** Przekazywanie logiki walidacji do API, obsługa błędów API.
- **Typy:** `TaskTableStateViewModel`, `TaskDTO`, `PaginatedResponse<TaskDTO>`, `CreateTaskCommand`, `UpdateTaskCommand`.
- **Propsy:** Brak.

### `TaskTableToolbar` (React)
- **Opis:** Pasek narzędziowy nad tabelą zawierający kontrolki filtrowania i potencjalne przyciski akcji zbiorczych.
- **Główne elementy:** `Input` (filtr tekstowy na pole `description`), `TaskStatusFilter`, `TaskCategoryFilter`.
- **Obsługiwane interakcje:** Zmiana wartości filtrów (wywołuje `onFilterChange`), akcje zbiorcze (np. `onBulkCategoryChange`).
- **Obsługiwana walidacja:** Podstawowa walidacja inputów (jeśli potrzebna).
- **Typy:** `TaskTableFiltersViewModel`.
- **Propsy:**
    - `filters: TaskTableFiltersViewModel`
    - `onFilterChange: (newFilters: Partial<TaskTableFiltersViewModel>) => void`
    - `selectedRowCount: number` (do włączania/wyłączania akcji zbiorczych)
    - `onBulkCategoryChange?: () => void`

### `TaskStatusFilter` (React)
- **Opis:** Komponent filtru statusu (np. "Wszystkie", "Ukończone", "Nieukończone") używający `Combobox` z Shadcn/ui.
- **Główne elementy:** `Combobox` (Shadcn).
- **Obsługiwane interakcje:** Wybór opcji filtra (wywołuje `onChange`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `'all' | 'completed' | 'incompleted'`.
- **Propsy:**
    - `value: 'all' | 'completed' | 'incompleted'`
    - `onChange: (value: 'all' | 'completed' | 'incompleted') => void`

### `TaskCategoryFilter` (React)
- **Opis:** Komponent filtru kategorii (np. "Wszystkie", "A", "B", "C") używający `Combobox` z Shadcn/ui.
- **Główne elementy:** `Combobox` (Shadcn).
- **Obsługiwane interakcje:** Wybór opcji filtra (wywołuje `onChange`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TaskCategory | 'all'`.
- **Propsy:**
    - `value: TaskCategory | 'all'`
    - `onChange: (value: TaskCategory | 'all') => void`

### `TaskDataTable` (React)
- **Opis:** Komponent renderujący tabelę (`Table` Shadcn) przy użyciu instancji `TanStack Table`. Wyświetla dane zadań, obsługuje sortowanie i paginację.
- **Główne elementy:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` (Shadcn), `TaskTablePagination`. Definicje kolumn dla `TanStack Table`, w tym komórki niestandardowe (`TaskStatusToggle`, `TaskCategoryToggle`, `TaskPriorityControl`, `TaskRowActions`).
- **Obsługiwane interakcje:** Wyświetlanie danych, sortowanie (kliknięcie nagłówka kolumny - *sortowanie wg priorytetu jest wymagane przez API*), zaznaczanie wierszy (checkbox).
- **Obsługiwana walidacja:** Brak bezpośredniej.
- **Typy:** `Table<TaskDTO>` (instancja TanStack Table), `ColumnDef<TaskDTO>[]`.
- **Propsy:**
    - `table: Table<TaskDTO>` (instancja z `useReactTable`)

### `TaskStatusToggle` (React)
- **Opis:** Checkbox w komórce tabeli do oznaczania zadania jako ukończone/nieukończone.
- **Główne elementy:** `Checkbox` (Shadcn).
- **Obsługiwane interakcje:** Kliknięcie checkboxa (wywołuje `onStatusChange`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `boolean`.
- **Propsy:**
    - `taskId: number`
    - `isSelected: boolean`
    - `onStatusChange: (taskId: number, isSelected: boolean) => void`

### `TaskCategoryToggle` (React)
- **Opis:** Przełącznik kategorii (A, B, C) w komórce tabeli, używający `ToggleGroup` z Shadcn/ui.
- **Główne elementy:** `ToggleGroup`, `ToggleGroupItem` (Shadcn).
- **Obsługiwane interakcje:** Wybór kategorii (wywołuje `onCategoryChange`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TaskCategory`.
- **Propsy:**
    - `taskId: number`
    - `currentCategory: TaskCategory | undefined` (undefined oznacza brak filtra)
    - `onCategoryChange: (taskId: number, newCategory: TaskCategory | undefined) => void`

### `TaskPriorityControl` (React)
- **Opis:** Przyciski "góra"/"dół" w komórce tabeli do zmiany priorytetu zadania.
- **Główne elementy:** `Button` (Shadcn) x2 (ikony strzałek).
- **Obsługiwane interakcje:** Kliknięcie przycisku "góra" (wywołuje `onPriorityChange('up')`), "dół" (wywołuje `onPriorityChange('down')`). Przyciski mogą być wyłączone dla skrajnych zadań.
- **Obsługiwana walidacja:** Logika włączania/wyłączania przycisków.
- **Typy:** `'up' | 'down'`.
- **Propsy:**
    - `taskId: number`
    - `currentPriority: number`
    - `isFirst: boolean` // Czy to zadanie o najwyższym priorytecie na liście?
    - `isLast: boolean` // Czy to zadanie o najniższym priorytecie na liście?
    - `onPriorityChange: (taskId: number, direction: 'up' | 'down') => void` // Logika zmiany priorytetu musi być zaimplementowana w kontenerze

### `TaskRowActions` (React)
- **Opis:** Menu kontekstowe (kropeczki) w komórce tabeli z akcjami: Edytuj, Duplikuj, Usuń.
- **Główne elementy:** `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator` (Shadcn).
- **Obsługiwane interakcje:** Wybór akcji z menu (wywołuje `onEdit`, `onDuplicate`, `onDelete`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:**
    - `taskId: number`
    - `taskData: TaskDTO` // Potrzebne do duplikacji
    - `onEdit: (taskId: number) => void` // Nawigacja do /tasks/{id}
    - `onDuplicate: (taskData: TaskDTO) => void`
    - `onDelete: (taskId: number) => void`

### `TaskTablePagination` (React)
- **Opis:** Komponent paginacji w stopce tabeli, używający stanu i metod z `TanStack Table`.
- **Główne elementy:** `Button` (Poprzednia, Następna strona, numery stron), `Select` (rozmiar strony), informacje o bieżącej stronie i liczbie wyników (Shadcn).
- **Obsługiwane interakcje:** Zmiana strony, zmiana rozmiaru strony.
- **Obsługiwana walidacja:** Wyłączanie przycisków nawigacyjnych na krańcach.
- **Typy:** `Table<TaskDTO>`.
- **Propsy:**
    - `table: Table<TaskDTO>`

## 5. Typy
- **`TaskDTO`**: Zdefiniowany w `src/types.ts`. Reprezentuje pojedyncze zadanie pobrane z API.
  ```typescript
  export type TaskDTO = {
    id: number;
    user_id: string; // UUID
    priority: number; // BIGINT jako number
    category: "A" | "B" | "C"; // ENUM z bazy danych
    task_source: "full-ai" | "edited-ai" | "edited-user";
    description: string; // VARCHAR(2000)
    created_at: string; // TIMESTAMPTZ jako ISO string
    updated_at: string; // TIMESTAMPTZ jako ISO string
    completed_at: string | null; // TIMESTAMPTZ jako ISO string lub null
  };
  ```
  *Uwaga:* Należy obsłużyć konwersję `completed_at` (null/string na boolean).

- **`PaginatedResponse<TaskDTO>`**: Zdefiniowany w `src/types.ts`. Struktura odpowiedzi z `GET /api/tasks`.
  ```typescript
  export interface PaginatedResponse<T> {
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  }
  ```

- **`CreateTaskCommand`**: Zdefiniowany w `src/types.ts`. Używany do `POST /api/tasks` (duplikacja).
  ```typescript
   // Omit<DBInsert, ...> & { category: TaskCategory ('A'|'B'|'C') }
  export type CreateTaskCommand = {
    priority: number;
    category: "A" | "B" | "C";
    task_source: "full-ai" | "edited-ai" | "edited-user";
    description: string;
  };
  ```

- **`UpdateTaskCommand`**: Zdefiniowany w `src/types.ts`. Używany do `PATCH /api/tasks/{id}`.
  ```typescript
  // Partial<Omit<DBUpdate, ...>> & { category?: TaskCategory ('A'|'B'|'C') }
  export type UpdateTaskCommand = {
    priority?: number;
    category?: "A" | "B" | "C";
    task_source?: "full-ai" | "edited-ai" | "edited-user";
    description?: string;
    completed_at?: string | null; // ISO string lub null
  };
  ```

- **`TaskTableFiltersViewModel`** (Nowy typ ViewModel dla stanu filtrów w UI):
  ```typescript
  export type TaskTableFiltersViewModel = {
    description: string; // Filtr tekstowy
    status: 'all' | 'completed' | 'incompleted'; // Filtr statusu w UI
    category: TaskCategory | 'all'; // Filtr kategorii w UI ('A'|'B'|'C' | 'all')
  };
  ```

- **`TaskTableStateViewModel`** (Nowy typ ViewModel dla głównego stanu kontenera - częściowo zarządzany przez TanStack Table i Query):
  ```typescript
  // Ten typ opisuje ogólny stan zarządzany przez TaskTableContainer
  // Rzeczywisty stan będzie rozproszony między useQuery, useReactTable i useState
  export type TaskTableStateViewModel = {
    // Stan zarządzany przez useReactTable (przekazywany do hooka)
    pagination: { pageIndex: number, pageSize: number };
    sorting: { id: string, desc: boolean }[]; // [ { id: 'priority', desc: boolean } ]
    rowSelection: Record<string, boolean>; // { [rowId]: true }

    // Stan filtrów (zarządzany przez useState, wpływa na useQuery)
    filters: TaskTableFiltersViewModel;

    // Stan danych z useQuery
    data?: PaginatedResponse<TaskDTO>;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  ```

## 6. Zarządzanie stanem
- **`TanStack Query` (`@tanstack/react-query`)**: Główny mechanizm zarządzania stanem serwera.
    - `useQuery`: Do pobierania listy zadań (`GET /api/tasks`). Klucz zapytania będzie zawierał filtry, paginację i sortowanie, aby zapewnić automatyczne odświeżanie po zmianach. Przechowuje dane (`PaginatedResponse<TaskDTO>`), stan ładowania (`isLoading`) i błędu (`isError`, `error`).
    - `useMutation`: Do operacji zapisu (`POST`, `PATCH`, `DELETE`). Będzie używany do duplikacji, aktualizacji (status, kategoria, priorytet) i usuwania zadań. Po sukcesie mutacji należy unieważnić zapytanie `GET /api/tasks` (`queryClient.invalidateQueries(...)`), aby odświeżyć listę.
- **`TanStack Table` (`@tanstack/react-table`)**: Do zarządzania stanem samej tabeli.
    - `useReactTable`: Hook inicjalizujący instancję tabeli. Skonfigurowany do obsługi:
        - Danych (`data` z `useQuery`).
        - Kolumn (`columns` z definicjami, w tym niestandardowymi komórkami).
        - Paginacji (stan `pagination`, `pageCount` z `useQuery`). Stan paginacji (`pageIndex`, `pageSize`) jest zarządzany przez hook, ale kontrolowany z zewnątrz (`onPaginationChange`).
        - Sortowania (stan `sorting`). API wspiera tylko sortowanie po `priority`, więc stan sortowania będzie ustawiony na stałe lub kontrolowany (`onSortingChange`).
        - Zaznaczenia wierszy (stan `rowSelection`, kontrolowany `onRowSelectionChange`).
- **`useState` (React)**: Do zarządzania lokalnym stanem UI, który wpływa na zapytania API:
    - Stan filtrów (`TaskTableFiltersViewModel`) w `TaskTableContainer`. Zmiany filtrów (potencjalnie z debouncingiem dla pola tekstowego) będą aktualizować ten stan i triggerować refetch `useQuery`.

Nie ma potrzeby tworzenia dedykowanego custom hooka dla całego widoku, ponieważ kombinacja `TanStack Query` i `TanStack Table` efektywnie zarządza większością złożoności stanu.

## 7. Integracja API
- **Pobieranie listy zadań:**
    - Wywołanie: `GET /api/tasks` przez `useQuery` w `TaskTableContainer`.
    - Parametry zapytania: Mapowane ze stanu `pagination`, `sorting` i `filters`:
        - `page={pagination.pageIndex + 1}`
        - `limit={pagination.pageSize}`
        - `order={sorting[0]?.desc ? 'desc' : 'asc'}` (zakładając sortowanie tylko po priorytecie)
        - `filter[category]={filters.category}` (jeśli różne od `'all'`)
        - `filter[completed]={statusToBoolean(filters.status)}` (jeśli różne od `'all'`) (gdzie `statusToBoolean` konwertuje `'completed'`->`true`, `'incompleted'`->`false`)
        - *Uwaga: `filter[description]` wymaga dodania obsługi w API (`src/pages/api/tasks/index.ts`).*
    - Typ odpowiedzi: `PaginatedResponse<TaskDTO>`.
    - Obsługa: Dane z odpowiedzi (`data.data`) są przekazywane do `TanStack Table`. Metadane (`data.meta`) służą do ustawienia `pageCount` i informacji w paginacji.

- **Aktualizacja zadania (Status, Kategoria, Priorytet):**
    - Wywołanie: `PATCH /api/tasks/{id}` przez `useMutation`.
    - Typ żądania: `UpdateTaskCommand`.
        - Zmiana statusu: `{ completed_at: isCompleted ? new Date().toISOString() : null }`
        - Zmiana kategorii: `{ category: newCategory }` (gdzie `newCategory` to 'A', 'B' lub 'C')
        - Zmiana priorytetu: `{ priority: newPriority }`. (zamieniamy - swapujemy - priorytet z priorytetem sąsiada za którego chcemy zmienić priorytet)
    - Typ odpowiedzi: `TaskDTO`.
    - Obsługa: Po sukcesie unieważnienie zapytania `GET /api/tasks`. Wyświetlenie komunikatu Toast (sukces/błąd).

- **Usuwanie zadania:**
    - Wywołanie: `DELETE /api/tasks/{id}` przez `useMutation`.
    - Typ odpowiedzi: `204 No Content`.
    - Obsługa: Po sukcesie unieważnienie zapytania `GET /api/tasks`. Wyświetlenie komunikatu Toast. Może wymagać potwierdzenia (`confirm()`).

- **Duplikowanie zadania:**
    - Wywołanie: `POST /api/tasks` przez `useMutation`.
    - Typ żądania: `CreateTaskCommand`. Dane pochodzą z `taskData` przekazanego do `onDuplicate`, z pominięciem pól `id`, `created_at`, etc. i ustawieniem `category` na format 'A'|'B'|'C'.
    - Typ odpowiedzi: `TaskDTO`.
    - Obsługa: Po sukcesie unieważnienie zapytania `GET /api/tasks`. Wyświetlenie komunikatu Toast.

*Ważne:* Wszystkie wywołania API muszą zawierać nagłówek `Authorization` z tokenem JWT (obsługiwane przez globalny wrapper fetch lub bibliotekę klienta API).

## 8. Interakcje użytkownika
- **Filtrowanie:**
    - Wpisanie tekstu w polu opisu -> (Po debounce) Aktualizacja stanu filtra `description`, refetch listy.
    - Wybór statusu z listy -> Aktualizacja stanu filtra `status`, refetch listy.
    - Wybór kategorii z listy -> Aktualizacja stanu filtra `category`, refetch listy.
- **Paginacja:**
    - Kliknięcie przycisku strony/nawigacji -> Aktualizacja stanu `pagination.pageIndex`, refetch listy.
    - Zmiana rozmiaru strony -> Aktualizacja stanu `pagination.pageSize`, refetch listy (zaczynając od strony 0).
- **Sortowanie:**
    - Kliknięcie nagłówka kolumny "Priorytet" (jeśli zaimplementowane jako sortowalne) -> Aktualizacja stanu `sorting`, refetch listy. (API domyślnie sortuje po priorytecie).
- **Akcje w wierszu:**
    - Zaznaczenie/odznaczenie Checkboxa statusu -> Wywołanie mutacji `PATCH` (zmiana `completed_at`).
    - Wybór kategorii w ToggleGroup -> Wywołanie mutacji `PATCH` (zmiana `category`).
    - Kliknięcie przycisku priorytetu "góra"/"dół" -> Wywołanie mutacji `PATCH` (zmiana `priority`).
    - Kliknięcie "Edytuj" w menu -> Nawigacja do `/tasks/{id}`.
    - Kliknięcie "Duplikuj" w menu -> Wywołanie mutacji `POST`. Pomija aktualnie zaznaczone zadania.
    - Kliknięcie "Usuń" w menu -> Wyświetlenie modala potwierdzającego -> Wywołanie mutacji `DELETE`.
- **Akcje zbiorcze:**
    - Zaznaczenie/odznaczenie głównego Checkboxa w nagłówku -> Zaznaczenie/odznaczenie wszystkich wierszy na stronie.
    - Zaznaczenie/odznaczenie Checkboxa w wierszu -> Aktualizacja stanu `rowSelection`.
    - Kliknięcie przycisku "Usuń zaznaczone" (jeśli zaimplementowane) -> Wyświetlenie modala potwierdzającego -> Wywołanie mutacji `DELETE` dla każdego zaznaczonego `taskId`, Toast, unieważnienie listy.

## 9. Warunki i walidacja
- **Filtry:**
    - Filtr statusu: Mapowanie UI ('all', 'completed', 'incompleted') na parametry API (`filter[completed]=true/false` lub brak parametru). Dotyczy `TaskStatusFilter` i `TaskTableContainer`.
    - Filtr kategorii: Mapowanie UI ('all', 'A', 'B', 'C') na parametry API (`filter[category]=A/B/C` lub brak parametru). Dotyczy `TaskCategoryFilter` i `TaskTableContainer`.
    - Filtr tekstowy: Wymaga implementacji po stronie API (`filter[description]=...`). Stan zarządzany w `TaskTableToolbar` i `TaskTableContainer`.
- **Paginacja:**
    - `page` musi być `>= 1`. `limit` musi być dodatnią liczbą całkowitą. Walidacja po stronie API, ale UI powinno zapobiegać wysyłaniu niepoprawnych wartości (np. wyłączając przyciski). Dotyczy `TaskTablePagination` i `TaskTableContainer`.
- **Aktualizacje (`PATCH`):**
    - `category` musi być 'A', 'B' lub 'C'. Walidacja po stronie API, UI (`TaskCategoryToggle`) zapewnia poprawne wartości.
    - `completed_at` musi być poprawnym ISO string lub `null`. UI (`TaskStatusToggle`) generuje poprawne wartości.
    - `priority` musi być liczbą. Walidacja po stronie API.
- **Tworzenie (`POST` - Duplikacja):**
    - Wymagane pola (`priority`, `category`, `task_source`, `description`) muszą być obecne i poprawnego typu. Walidacja po stronie API (Zod). UI (`TaskRowActions`, `TaskTableContainer`) przygotowuje payload.
- **Dostęp:**
    - Wszystkie operacje API wymagają autoryzacji. Błędy 401 powinny skutkować przekierowaniem do logowania (obsługa globalna). API zapewnia, że użytkownik operuje tylko na własnych zadaniach (RLS).

## 10. Obsługa błędów
- **Błędy pobierania listy (`GET /api/tasks`):**
    - `useQuery` zwróci `isError=true` i `error`. W `TaskTableContainer` należy wyświetlić komunikat błędu zamiast tabeli (np. "Nie udało się załadować zadań. Spróbuj ponownie.") i zalogować błąd. Można dodać przycisk "Spróbuj ponownie" (`refetch`).
- **Błędy mutacji (`POST`, `PATCH`, `DELETE`):**
    - `useMutation` zwróci `isError=true` i `error`. Należy wyświetlić powiadomienie Toast z komunikatem błędu (np. "Błąd podczas usuwania zadania: [komunikat z API]" lub generyczny "Coś poszło nie tak"). Szczegółowy błąd należy zalogować. Jeśli używano aktualizacji optymistycznych, należy je cofnąć.
- **Błędy walidacji API (400 Bad Request):**
    - Wyświetlić Toast z komunikatem błędu zwróconym przez API. Zalogować błąd.
- **Brak autoryzacji (401 Unauthorized):**
    - Globalny handler (np. w wrapperze fetch) powinien przechwycić 401 i przekierować użytkownika do `/login`.
- **Zasób nie znaleziony (404 Not Found - np. przy `PATCH`/`DELETE` nieistniejącego zadania):**
    - Wyświetlić Toast informujący, że zadanie nie zostało znalezione. Unieważnić listę zadań, aby usunąć nieistniejący wpis z UI. Zalogować błąd.
- **Brak uprawnień (403 Forbidden - mało prawdopodobne przy RLS):**
    - Wyświetlić generyczny błąd Toast. Zalogować błąd.

Należy stosować komponent `Toast` z Shadcn/ui do informowania użytkownika o wynikach operacji (sukces, błąd).

## 11. Kroki implementacji
1.  **Przygotowanie:** Utworzyć plik strony `src/pages/tasks.astro` oraz pliki dla komponentów React w `src/components/tasks/` (np. `TaskTableContainer.tsx`, `TaskDataTable.tsx`, `TaskTableToolbar.tsx`, etc.).
2.  **Strona Astro (`TaskListPage.astro`):** Zdefiniować routing, dodać podstawowy layout i osadzić `TaskTableContainer` z dyrektywą `client:load`. Dodać ochronę routingu (przekierowanie dla niezalogowanych).
3.  **Kontener React (`TaskTableContainer.tsx`):**
    - Zainicjalizować `TanStack Query` (`QueryClientProvider` w głównym pliku layoutu lub aplikacji).
    - Zaimplementować `useQuery` do pobierania danych z `GET /api/tasks`, uwzględniając mapowanie stanu filtrów i paginacji na parametry API.
    - Zainicjalizować `TanStack Table` (`useReactTable`), przekazując dane z `useQuery`, definicje kolumn oraz zarządzany stan paginacji, sortowania i zaznaczenia.
    - Zaimplementować zarządzanie stanem filtrów (`useState`).
    - Renderować `TaskTableToolbar` i `TaskDataTable`.
    - Zaimplementować funkcje obsługi mutacji (`useMutation` dla `POST`, `PATCH`, `DELETE`) i przekazać je jako propsy do komponentów podrzędnych. Dodać logikę unieważniania zapytań i wyświetlania Toastów.
    - Dodać obsługę stanów ładowania i błędów (`LoadingSpinner`, `ErrorDisplay`).
4.  **Komponenty Filtrowania (`TaskTableToolbar.tsx`, `TaskStatusFilter.tsx`, `TaskCategoryFilter.tsx`):**
    - Zbudować UI używając komponentów Shadcn (`Input`, `Select`/`Combobox`).
    - Połączyć stan komponentów z propsami i wywoływać `onFilterChange` przy zmianach.
    - Zaimplementować debouncing dla filtra tekstowego.
5.  **Komponent Tabeli (`TaskDataTable.tsx`):**
    - Zdefiniować `ColumnDef<TaskDTO>[]`, w tym:
        - Kolumna zaznaczenia (używająca `header` i `cell` z `table.getIsAllRowsSelected`, `row.getIsSelected`, etc.).
        - Kolumny danych (`description`, `created_at`, etc.).
        - Kolumny niestandardowe używające prop `cell` do renderowania:
            - `TaskStatusToggle`
            - `TaskCategoryToggle`
            - `TaskPriorityControl`
            - `TaskRowActions`
    - Renderować komponenty `Table` z Shadcn, przekazując dane i metody z instancji `table`.
    - Zaimplementować `TaskTablePagination` używając stanu i metod z `table`.
6.  **Komponenty Komórek Niestandardowych (`TaskStatusToggle`, `TaskCategoryToggle`, `TaskPriorityControl`, `TaskRowActions`):**
    - Zaimplementować logikę i UI każdego komponentu (Shadcn Checkbox, ToggleGroup, Button, DropdownMenu).
    - Połączyć interakcje użytkownika z wywołaniami funkcji zwrotnych (propsów) przekazanych z `TaskTableContainer` (np. `onStatusChange`, `onCategoryChange`, `onDelete`).
    - Zaimplementować logikę `TaskPriorityControl` (włączanie/wyłączanie przycisków, określanie kierunku zmiany).
    - Zaimplementować nawigację dla akcji "Edytuj".
7.  **Stylowanie:** Użyć Tailwind i klas Shadcn do ostylowania komponentów zgodnie z projektem.
8.  **Refaktoryzacja i Optymalizacja:** Przejrzeć kod pod kątem czystości, wydajności i zgodności z wytycznymi (`shared.mdc`). Zoptymalizować liczbę renderowań i zapytań API.
9. **Aktualizacja API (Opcjonalnie):** Filtr tekstowy jest kluczowy, zaktualizować endpoint `GET /api/tasks` (`src/pages/api/tasks/index.ts`), aby go obsługiwał.