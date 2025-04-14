# Plan implementacji widoku Formularz generowania i edycji opisu todo (AI)

## 1. Przegląd
Widok umożliwia użytkownikowi wygenerowanie szczegółowego opisu zadania przy użyciu AI, na podstawie krótkiej notatki oraz kontekstu z profilu. Użytkownik ma możliwość edycji wygenerowanego opisu przed zatwierdzeniem, co pozwala na utworzenie precyzyjnie opisanego zadania zgodnego z zasadami SMART.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/tasks/new`.

## 3. Struktura komponentów
- **TasksNewView** (strona widoku)
  - **TaskCreationForm** – formularz do wprowadzania notatki i inicjowania generowania opisu
  - **ModalDialog** – okno modalne do wyświetlania oraz edycji wygenerowanego opisu. Zawiera pole tekstowe read-only z oryginalnym opisem, i pole edytowalne z opisem wygenerowanym przez AI.
  - **LoadingSpinner** – wskaźnik ładowania podczas generowania opisu
  - **ToastNotifications** – system powiadomień o sukcesie lub błędach

## 4. Szczegóły komponentów
### TaskCreationForm
- **Opis**: Formularz umożliwiający użytkownikowi wpisanie krótkiej notatki opisującej zadanie oraz rozpoczęcie procesu generowania szczegółowego opisu.
- **Główne elementy**: 
  - Pole tekstowe (input) dla notatki
  - Pole wyboru kategorii (wykorzystanie już zaimplementowanego TaskCategoryToggle.tsx)
  - Przycisk "Generuj opis"
- **Obsługiwane zdarzenia**:
  - onChange – aktualizacja stanu pola notatki
  - onClick – wywołanie funkcji inicjującej zapytanie do API AI
- **Warunki walidacji**:
  - Pole nie może być puste
- **Typy**:
  - Lokalny stan: `note: string`
- **Propsy**:
  - Callback do obsługi przejścia do modal dialog po otrzymaniu wygenerowanego opisu

### ModalDialog
- **Opis**: Okno modalne wyświetlające wygenerowany opis zadania, umożliwiające jego edycję przed akceptacją.
- **Główne elementy**:
  - Pole tekstowe (textarea) tylko do odczytu z oryginalną wiadomością
  - Pole tekstowe (textarea) do edycji opisu
  - Przycisk "Akceptuj" do zatwierdzenia opisu
  - Przycisk "Anuluj" do cofnięcia operacji
- **Obsługiwane zdarzenia**:
  - onChange – aktualizacja treści opisu
  - onClick – zatwierdzanie lub anulowanie operacji
- **Warunki walidacji**:
  - Opis nie może przekraczać 2000 znaków
- **Typy**:
  - `generatedDescription: string`
  - `taskSource: TaskSource`
- **Propsy**:
  - Flaga widoczności (boolean)
  - Początkowa treść opisu
  - Callback do akceptacji edycji

### LoadingSpinner
- **Opis**: Wizualny wskaźnik informujący użytkownika o trwającym procesie generowania opisu.
- **Implementacja**: Może być wykorzystany komponent ze Shadcn/ui lub dedykowany komponent spinnera.

### ToastNotifications
- **Opis**: System wyświetlania krótkich komunikatów (toastów) informujących o sukcesach, błędach lub innych ważnych zdarzeniach.
- **Implementacja**: Wykorzystanie elementu sonner.tsx

## 5. Typy
- **TaskCreationViewModel**:
  - `note: string` – wpisana przez użytkownika notatka
  - `generatedDescription: string` – opis wygenerowany przez AI
- **CreateTaskCommand** (typ z types.ts): 

## 6. Zarządzanie stanem
- Użycie hooka `useState` do zarządzania stanem:
  - `note` – przechowuje wartość wprowadzoną przez użytkownika
  - `generatedDescription` – przechowuje opis otrzymany z API AI
  - `isLoading` – kontroluje wyświetlanie LoadingSpinner
  - `showModal` – decyduje o wyświetleniu ModalDialog
- Opcjonalnie: Stworzenie customowego hooka (np. `useTaskCreation`) do enkapsulacji logiki generowania opisu i tworzenia zadania.

## 7. Integracja API
- **Wywołanie AI Generation**:
  - Endpoint (przykładowy): POST `/api/ai/generate-description`
  - Payload: `{ note: string, userContext: string }`
  - Odpowiedź: `{ generatedDescription: string }`
- **Tworzenie zadania**:
  - Endpoint: POST `/api/tasks`
  - Payload: `CreateTaskCommand` (przy wykorzystaniu wygenerowanego i ewentualnie edytowanego opisu)
  - Weryfikacja odpowiedzi pod kątem błędów walidacji i sukcesu operacji

## 8. Interakcje użytkownika
- Użytkownik wpisuje notatkę w polu tekstowym i klika przycisk "Generuj opis".
- Wyświetlany jest LoadingSpinner podczas oczekiwania na odpowiedź z API AI.
- Po otrzymaniu odpowiedzi, pojawia się ModalDialog z wygenerowanym opisem umożliwiającym jego edycję.
- Użytkownik może edytować opis, zatwierdzić bez edycji lub anulować operację.
- Po zatwierdzeniu, wykonywane jest wywołanie API do utworzenia zadania, a użytkownik otrzymuje odpowiedni komunikat (toast) i jest przeniesiony na stronę `/tasks`.

## 9. Warunki i walidacja
- Notatka w formularzu nie może być pusta.
- Wygenerowany opis musi być krótszy niż 2000 znaków, zgodnie z ograniczeniami API.
- Payload wysyłany do API musi spełniać wymagania walidacyjne, takie jak poprawny typ dla `priority`, `category` oraz `task_source`.
- Weryfikacja odpowiedzi z API: w przypadku błędu, wyświetlenie odpowiedniego komunikatu.

## 10. Obsługa błędów
- Błędy podczas wywołania API AI lub tworzenia zadania będą przechwytywane i wyświetlane za pomocą systemu toast notifications.
- Walidacja pól na poziomie front-endu zapobiega wysyłaniu nieprawidłowych danych (np. pusta notatka, przekroczenie limitu znaków).
- Dodatkowe logowanie błędów może być pomocne w debugowaniu.

## 11. Kroki implementacji
1. Utworzenie nowej strony widoku w `src/pages/tasks/new.astro`.
2. Stworzenie komponentu `TaskCreationForm` w `src/components/TaskCreationForm.tsx`:
   - Implementacja pola input dla notatki.
   - Dodanie przycisku inicjującego wywołanie do API AI.
3. Stworzenie komponentu `ModalDialog` w `src/components/ModalDialog.tsx`:
   - Implementacja pola textarea, przycisków "Akceptuj" oraz "Anuluj".
4. Integracja komponentu `LoadingSpinner` do sygnalizacji oczekiwania.
5. Dodanie toastu dla komunikatów użytkownika.
6. Implementacja logiki wywołania API:
   - Wywołanie mocka endpointu AI do generowania opisu
   - Wywołanie endpointu POST `/api/tasks` w celu utworzenia zadania
9. Przegląd kodu i wdrożenie ewentualnych poprawek. 