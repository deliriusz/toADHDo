/*
 * Definicje typów DTO i Command Model dla aplikacji
 *
 * Poniższe typy odpowiadają planowi API i modelom bazy danych:
 *
 * 1. TaskDTO - reprezentuje rekord encji zadania z bazy danych (odczyt).
 * 2. CreateTaskCommand - model polecenia do tworzenia nowego zadania, wywodzi się z typu Insert, ale z modyfikacją typu "category" (API oczekuje wartości "A", "B", "C").
 * 3. UpdateTaskCommand - model polecenia do aktualizacji zadania, częściowo opcjonalny, z modyfikacją "category" na typ "A" | "B" | "C".
 * 4. UserContextDTO - reprezentuje rekord kontekstu użytkownika.
 * 5. SaveUserContextCommand - model polecenia do tworzenia lub aktualizacji kontekstu użytkownika, zawiera jedynie "context_data".
 * 6. ProcessingLogDTO - reprezentuje rekord logu przetwarzania.
 * 7. PaginatedResponse<T> - generyczny typ odpowiedzi zawierającej dane stronicowane, używany przy listowaniu.
 */

import type { Database } from "./db/database.types";

export type TaskCategory = "A" | "B" | "C";
export type TaskSource = "full-ai" | "edited-ai" | "edited-user";

// Task DTO: Bezpośrednie mapowanie na rekord zadania z bazy danych.
export type TaskDTO = Database["public"]["Tables"]["task"]["Row"];

// CreateTaskCommand: Dane wymagane do utworzenia nowego zadania.
// Bazuje na typie Insert, pomijając pola generowane automatycznie oraz user_id i completed_at.
// Uwaga: Pole "category" zostaje nadpisane, aby przyjmować wartości "A", "B" lub "C" zgodne z wymaganiami API.
export type CreateTaskCommand = Omit<
  Database["public"]["Tables"]["task"]["Insert"],
  "id" | "created_at" | "updated_at" | "user_id" | "completed_at" | "category"
> & {
  category: TaskCategory; // API przesyła kategorię w formacie uppercase; przed zapisem do DB konieczna jest konwersja na lowercase.
  task_source: TaskSource;
};

// UpdateTaskCommand: Dane do aktualizacji istniejącego zadania.
// Bazuje na typie Update, zawiera tylko dozwolone pola, a pole "category" przyjmuje wartości "A", "B" lub "C".
export type UpdateTaskCommand = Partial<
  Omit<Database["public"]["Tables"]["task"]["Update"], "id" | "created_at" | "updated_at" | "user_id" | "category">
> & {
  category?: TaskCategory; // Opcjonalne, jeśli przesłane to wymagają transformacji przed aktualizacją bazy danych.
};

// UserContextDTO: Bezpośrednie mapowanie na rekord kontekstu użytkownika.
export type UserContextDTO = Database["public"]["Tables"]["user_context"]["Row"];

// SaveUserContextCommand: Dane do utworzenia lub aktualizacji kontekstu użytkownika. Przyjmuje jedynie "context_data".
export type SaveUserContextCommand = Pick<Database["public"]["Tables"]["user_context"]["Insert"], "context_data">;

// ProcessingLogDTO: Bezpośrednie mapowanie na rekord logu przetwarzania.
export type ProcessingLogDTO = Database["public"]["Tables"]["processing_log"]["Row"];

// Generyczny typ odpowiedzi stronicowanej, używany do odpowiedzi endpointów listujących dane.
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
