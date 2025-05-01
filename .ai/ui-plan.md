# Architektura UI dla toADHDo

## 1. Przegląd struktury UI

Aplikacja toADHDo zapewnia responsywny interfejs użytkownika, który wspiera trzy główne breakpointy: mobile, tablet i desktop. Domyślnie uruchamia się w trybie dark, z możliwością przełączenia na light. Nawigacja dostosowana jest do urządzenia: na mobile - top navigation z hamburger menu, a na tablet/desktop - boczny sidebar. Kluczowymi elementami są widok listy zadań do wykonania, formularz generowania AI opisu todo, modal dialog do edycji opisu zadania wygenerowanego przez AI oraz strona logowania. Interfejs integruje się z backendem opartym na Supabase, zgodnym z wymaganiami API, oraz realizuje komunikację przez toast notifications, loading spinner i mechanizmy autoryzacji użytkownika.

## 2. Lista widoków

1. **(Lista zadań)**
   - **Ścieżka widoku:** `/tasks`
   - **Główny cel:** Prezentacja listy zadań użytkownika z paginacją (20 zadań na stronę).
   - **Kluczowe informacje:** Tabela (`Table` z Shadcn/ui z wykorzystaniem TanStack Table - https://tanstack.com/table ). `TableHeader` zawiera pole tekstowe do filtrowania po opisie taska, pola wyboru filtra statusu i kategorii (`Combobox` z Shadcn/ui). Każdy wiersz zawiera pola do zaznaczenia (`Checkbox` z Shadcn/ui do pracy na wielu zadaniach), treść, status (`Checkbox` ukończone, nieukończone), kategoria (`ToggleGroup` z Shadcn/ui z opcjami A | B | C), menu kontekstowe z opcjami (Edytuj, Duplikuj, Usuń). Stopka zawiera elementy do paginacji.
   - **Kluczowe komponenty:** Tabela z listą zadań, komponent paginacji. Każdy wiersz zawiera przyciski akcji (edycja, usunięcie), przycisk zmiany kategorii ("A" | "B" | "C"), pzycisk do zaznaczania statusu zadania jako wykonane albo niewykonane, przycisk zmiany priorytetu ("up" | "down"), loading spinner.
   - **UX/Dostępność/Security:** Wysoki kontrast, responsywność, komunikaty toast dla potwierdzeń/alertów; autoryzacja i walidacja danych.

2. **Formularz generowania i edycji opisu todo (AI)**
   - **Ścieżka widoku:** `/tasks/new`
   - **Główny cel:** Umożliwienie użytkownikowi generowania opisu zadania przy użyciu AI oraz jego edycja przed zapisaniem.
   - **Kluczowe informacje:** Pola formularza, widoczny modal dialog z wygenerowanym opisem, przyciski do akceptacji lub zamknięcia modala.
   - **Kluczowe komponenty:** Formularz z wywołaniem AI, modal dialog, loading spinner, toast notifications.
   - **UX/Dostępność/Security:** Walidacja danych, natychmiastowe informacje o błędach, bezpieczna komunikacja z API.

3. **Strona logowania**
   - **Ścieżka widoku:** `/login`
   - **Główny cel:** Zapewnienie mechanizmu logowania użytkownika.
   - **Kluczowe informacje:** Formularz logowania (e-mail, hasło), przycisk logowania, link do resetowania hasła.
   - **Kluczowe komponenty:** Formularz, przyciski, wskaźniki błędów.
   - **UX/Dostępność/Security:** Silne zabezpieczenia, jasne komunikaty błędów, wsparcie dla czytników ekranu.

4. **Widok szczegółów zadania**
   - **Ścieżka widoku:** `/tasks/{id}`
   - **Główny cel:** Prezentacja szczegółowych informacji o wybranym zadaniu.
   - **Kluczowe informacje:** Kompletny opis zadania, informacje o priorytecie, kategorii, czasie utworzenia, statusie. Formularz jest taki sam i podlega tym samym zasadom, co `/tasks/new`.
   - **Kluczowe komponenty:** Szczegółowe karty informacyjne, przyciski do edycji i aktualizacji statusu.
   - **UX/Dostępność/Security:** Przejrzysty układ, łatwa nawigacja wewnętrzna, zabezpieczenia przed nieautoryzowanym dostępem.

5. **Widok zarządzania danymi użytkownika - kontekstem użytkownika**
   - **Ścieżka widoku:** `/profile`
   - **Główny cel:** Wyświetlenie i edycja profilu użytkownika - jego danych kontekstowych użytkownika.
   - **Kluczowe informacje:** Aktualny kontekst użytkownika, opcje modyfikacji i zapisu zmian.
   - **Kluczowe komponenty:** Formularz edycyjny, przyciski akcji - "zaakceptuj", "odrzuć".
   - **UX/Dostępność/Security:** Prosty interfejs, walidacja danych, zabezpieczenia przy modyfikacjach.

## 3. Mapa podróży użytkownika

1. **Logowanie:** Użytkownik wchodzi na stronę `/login` i loguje się przy użyciu danych uwierzytelniających.
2. **Lista zadań:** Po skutecznym logowaniu użytkownik zostaje przekierowany na `/tasks`, gdzie ogląda listę swoich zadań.
2.1. **Wyszukiwanie zadań:** Z widoku listy zadań użytkownik może przefiltrować dane po statusie zadania oraz kategorii. W tym przypadku wyłącznie zadania spełniające dane kryteria będą wyświetlone użytkownikowi.
3. **Szczegóły zadania:** Kliknięcie na konkretne zadanie przekierowuje użytkownika do `/tasks/{id}`, gdzie widzi szczegóły zadania.
4. **Generowanie opisu zadania:** Użytkownik przechodzi na stronę `/tasks/new` poprzez przycisk "nowy TODO" z widoku listy zadań, wprowadza dane w formularzu i uruchamia generowanie opisu. W modal dialogu otrzymuje wygenerowany opis i ma możliwość jego edycji albo akceptacji.
5. **Zarządzanie kontekstem:** Użytkownik może przejść do widoku `/profile`, aby zaktualizować dane kontekstowe.
6. **Powrót do listy zadań:** Po zakończeniu akcji użytkownik wraca do listy zadań, aby zobaczyć zaktualizowaną listę zadań, komunikaty potwierdzające operacje wyświetlane są przez toast notifications.

## 4. Układ i struktura nawigacji

- **Mobile:** Górna nawigacja z hamburger menu, które rozwija listę opcji nawigacyjnych (Lista zadań, nowy TODO, Profile, Logowanie).
- **Tablet/Desktop:** Sidebar widoczny na stałe z listą linków do głównych widoków, z wyraźnym wskaźnikiem aktywnego widoku.
- **Mechanizm nawigacji:** Wszystkie widoki są dostępne w ramach autoryzowanego obszaru, a brak uprawnień skutkuje automatycznym przekierowaniem do `/login`.
- **Dodatkowe funkcje:** Responsywne elementy interfejsu, intuicyjne priorytetyzowanie akcji, wsparcie dla klawiatury i czytników ekranu, takie jak odpowiednie etykiety ARIA.

## 5. Kluczowe komponenty

- **Lista zadań:** Komponent renderujący listę tasków, obsługuje paginację i dynamiczne aktualizacje.
- **Modal dialog:** Komponent umożliwiający interaktywne okno do przeglądu i edycji wygenerowanego opisu zadania.
- **Loading spinner:** Wizualny wskaźnik stanu ładowania danych.
- **Toast notifications:** System informowania użytkownika o sukcesach, błędach i innych zdarzeniach.
- **Formularze:** Zwalidowane, responsywne formularze do logowania, generowania opisów i edycji danych użytkownika.
- **Nawigacja:** Komponenty top navigation (mobile) oraz sidebar (desktop/tablet) dostosowane do różnych rozmiarów ekranów. 