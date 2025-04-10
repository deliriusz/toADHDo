# Schemat bazy danych PostgreSQL

## 1. Tabele i typy

### 1.1. Typy ENUM
```sql
-- Typ dla kolumny category w tabeli task
CREATE TYPE task_category AS ENUM ('A', 'B', 'C');

-- Typ dla kolumny task_source w tabeli task
CREATE TYPE task_source AS ENUM ('full-ai', 'edited-ai', 'edited-user');
```

### 1.2. Tabela `task`
```sql
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    priority BIGINT NOT NULL,
    category task_category NOT NULL,
    task_source task_source NOT NULL,
    description VARCHAR(2000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

*Uwagi:*
- Każde zadanie jest powiązane z użytkownikiem poprzez `user_id`, z usunięciem kaskadowym przy usunięciu użytkownika.
- Kolumna `priority` jest typu BIGINT, a znaczniki czasowe są w formacie TIMESTAMPTZ.

### 1.3. Tabela `user_context`
```sql
CREATE TABLE user_context (
    user_id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    -- Miejsce na dodatkowe dane kontekstowe
    context_data VARCHAR(5000) NOT NULL,
);
```

*Uwagi:*
- Tabela `user_context` reprezentuje relację 1:1 z użytkownikiem, gdzie `user_id` jest zarówno kluczem głównym, jak i kluczem obcym.

### 1.4. Tabela `processing_log`
```sql
CREATE TABLE processing_log (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES task(id) ON DELETE NO ACTION,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    processing_time BIGINT NOT NULL,  -- wartość w milisekundach
    status TEXT NOT NULL,            -- status logu przetwarzania
    error_message TEXT,              -- komunikaty błędów
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

*Uwagi:*
- Logi przetwarzania odnoszą się do konkretnego zadania (`task_id`) oraz użytkownika (`user_id`).
- W przypadku usunięcia użytkownika, logi zostaną usunięte kaskadowo, natomiast usunięcie zadania nie powoduje akcji kaskadowych.

## 2. Relacje między tabelami

- `task` → `user`: Wielu tasków może należeć do jednego użytkownika (relacja wiele-do-jednego).
- `user_context` → `user`: Encja 1:1, gdzie `user_context.user_id` to klucz główny oraz obcy odnoszący się do `user.id`.
- `processing_log` → `task`: Każdy wpis logu odnosi się do jednego zadania (relacja wiele-do-jednego).
- `processing_log` → `user`: Każdy wpis logu odnosi się do jednego użytkownika (relacja wiele-do-jednego).

## 3. Indeksy

- Domyślnie każda tabela posiada indeks na klucz główny.
- Dodatkowe indeksy:
  - `task (user_id)` – ułatwia filtrowanie zadań przypisanych do danego użytkownika.
  - `processing_log (task_id)` – optymalizuje pobieranie logów dla konkretnego zadania.
  - `processing_log (user_id)` – przyspiesza zapytania dotyczące logów użytkownika.

## 4. Zasady bezpieczeństwa (Row-Level Security, RLS)

### 4.1. Tabela `task`
```sql
ALTER TABLE task ENABLE ROW LEVEL SECURITY;
CREATE POLICY task_rls_policy ON task 
    USING (user_id = current_setting('app.current_user_id')::uuid);
```

### 4.2. Tabela `user_context`
```sql
ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_context_rls_policy ON user_context 
    USING (user_id = current_setting('app.current_user_id')::uuid);
```

### 4.3. Tabela `processing_log`
```sql
ALTER TABLE processing_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY processing_log_rls_policy ON processing_log 
    USING (
        current_setting('app.current_user_role') IN ('admin', 'dev') 
        OR user_id = current_setting('app.current_user_id')::uuid
    );
```

*Uwagi:*
- Polityki RLS dla tabel `task` i `user_context` ograniczają dostęp do danych tylko do rekordów powiązanych z aktualnie zalogowanym użytkownikiem.
- W tabeli `processing_log` administratorzy oraz członkowie zespołu deweloperskiego mają dostęp do wszystkich logów, natomiast pozostali użytkownicy widzą jedynie swoje logi.

## 5. Dodatkowe uwagi

- Przy usunięciu użytkownika, powiązane rekordy w tabelach `task` i `processing_log` zostaną usunięte kaskadowo.
- Usunięcie rekordu z tabeli `task` nie wywołuje żadnych akcji kaskadowych w innych tabelach.
- Schemat jest zaprojektowany zgodnie z zasadami 3NF oraz najlepszymi praktykami dla wydajności i skalowalności aplikacji wykorzystującej Supabase, Astro, TypeScript, React, Tailwind oraz Shadcn/ui.