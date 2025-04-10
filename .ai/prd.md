# Dokument wymagań produktu (PRD) - toADHDo (MVP)

## 1. Przegląd produktu
Produkt toADHDo (MVP) to aplikacja zaprojektowana z myślą o osobach z ADHD, dla których tradycyjne listy TODO nie są efektywne. Aplikacja wykorzystuje AI do generowania spersonalizowanych zadań na podstawie krótkiej notatki wprowadzonej przez użytkownika oraz dodatkowego kontekstu zawartego w jego profilu. Umożliwia przeglądanie, edycję, zapisywanie oraz usuwanie zadań, zaznacznaie zadań jako wykonane a także ich organizację według trzech kategorii (A, B, C) wraz z możliwością zmiany priorytetu. Interfejs został zaprojektowany z myślą o prostocie, intuicyjności i przyszłej skalowalności.

## 2. Problem użytkownika
Osoby z ADHD często mają trudności z koncentracją, planowaniem i utrzymaniem motywacji. Tradycyjne listy TODO nie odpowiadają na specyficzne potrzeby, gdyż:
- Nie automatyzują przekształcania krótkich notatek w szczegółowe opisy zgodne z metodologią SMART.
- Nie uwzględniają indywidualnego kontekstu użytkownika, który mógłby wpłynąć na lepsze zdefiniowanie celu.
- Nie oferują intuicyjnych narzędzi do edycji, organizacji i priorytetyzacji zadań.

## 3. Wymagania funkcjonalne
1. Umożliwienie tworzenia nowych zadań przez wpisanie krótkiej notatki.
2. Automatyczne generowanie spersonalizowanego opisu zadania przez AI na podstawie notatki i kontekstu z profilu użytkownika, przy zachowaniu zasad SMART (Specific, Measurable, Achievable, Relevant, Time-Bound).
3. Wyświetlanie wygenerowanego opisu zadania w pobocznym oknie, umożliwiającym jego edycję.
4. Możliwość edycji i akceptacji wygenerowanego opisu zadania przez użytkownika.
5. Zapisywanie, odczytywanie, przeglądanie oraz usuwanie zadania w systemie.
6. System kont użytkowników umożliwiający logowanie, rejestrację oraz zarządzanie profilem (w tym aktualizację informacji kontekstowych dla AI).
7. Funkcjonalność zmiany kategorii zadania (A, B, C) z wizualnym wyróżnieniem aktualnie wybranej opcji.
8. Możliwość zmiany priorytetu zadania w obrębie danej kategorii za pomocą przycisków "up" i "down".
9. Logowanie operacji generowania zadania, obejmujące: identyfikator użytkownika, czas generowania, długość i hash oryginalnego opisu, informacje o błędach oraz czas ich wystąpienia.
10. Wyświetlenie standardowego komunikatu "coś poszło nie tak, spróbuj ponownie później" w przypadku wystąpienia błędu podczas generowania zadania.

## 4. Granice produktu
1. Aplikacja nie obsługuje multimediów (np. zdjęć, wideo).
2. Udostępnianie zadań innym użytkownikom jest wyłączone.
3. Funkcje społecznościowe i współpracy nie są przewidziane w MVP.
4. Organizacja zadań w projekty oraz tagowanie nie są wdrażane.
5. Automatyczne przypisywanie lub zmiana priorytetu zadań nie jest przewidziana – użytkownik dokonuje modyfikacji ręcznie.
6. Aplikacja nie wysyła przypomnień ani nie generuje statystyk wykonanych zadań.
7. AI korzysta wyłącznie z danych przekazanych przez użytkownika w profilu, bez dodatkowych źródeł zewnętrznych.

## 5. Historyjki użytkowników

US-001
Tytuł: Utworzenie zadania
Opis: Użytkownik wpisuje krótką notatkę opisującą zadanie, która jest wykorzystywana do wygenerowania szczegółowego opisu zadania przez AI, z uwzględnieniem metodologii SMART.
Kryteria akceptacji:
- Użytkownik może wprowadzić notatkę w dedykowanym polu.
- System wysyła notatkę wraz z kontekstem z profilu do modułu AI.
- Wygenerowany opis zadania spełnia kryteria SMART.
- użytkownik może zaakceptować albo edytować notatkę wygenerowaną przez AI.

US-002
Tytuł: Edycja wygenerowanego zadania
Opis: Po wygenerowaniu opisu, użytkownik ma możliwość edycji treści zadania, aby dopasować go do swoich oczekiwań.
Kryteria akceptacji:
- Interfejs umożliwia edycję wygenerowanego opisu.
- Dokonane zmiany są zapisywane i odzwierciedlone w liście zadań.

US-004
Tytuł: Przeglądanie listy zadań
Opis: Użytkownik przegląda listę wszystkich zapisanych zadań, widząc ich status, kategorię i priorytet.
Kryteria akceptacji:
- Lista wyświetla wszystkie zadania przypisane do danego użytkownika.
- Każde zadanie zawiera informacje o statusie wykonania, przypisanej kategorii oraz priorytecie.
- Domyślnie wyłącznie zadania, które nie zostały jeszcze wykonane są widoczne dla użytkownika. Użytkownik może zmienić widok, żeby uwzględnić również wykonane zadanie.

US-005
Tytuł: Oznaczenie zadania jako ukończonego
Opis: Użytkownik może oznaczyć zadanie jako wykonane, zmieniając jego status na liście.
Kryteria akceptacji:
- Po kliknięciu odpowiedniego przycisku, status zadania zmienia się na "ukończone".
- Zmiana statusu jest widoczna na liście zadań.
- Do ukończonego zadania dodany jest aktualna data jako czas wykonania.

US-006
Tytuł: Zmiana kategorii zadania
Opis: Użytkownik ma możliwość zmiany kategorii zadania (A, B, C) poprzez wybór odpowiedniej opcji, przy czym aktywna kategoria jest wyraźnie wyróżniona.
Kryteria akceptacji:
- Interfejs umożliwia przełączanie między kategoriami A, B i C.
- Aktualnie wybrana kategoria jest wizualnie wyróżniona.

US-007
Tytuł: Zmiana priorytetu zadania
Opis: Użytkownik może zmieniać pozycję zadania w obrębie danej kategorii za pomocą przycisków "up" i "down", co pozwala na ustalenie priorytetu.
Kryteria akceptacji:
- Przyciski "up" i "down" są dostępne dla wszystkich zadań.
- Zmiana priorytetu jest natychmiast widoczna na liście zadań.

US-008
Tytuł: Aktualizacja profilu użytkownika
Opis: Użytkownik może modyfikować swój profil w celu dodania lub aktualizacji informacji wykorzystywanych jako kontekst do generowania zadań przez AI.
Kryteria akceptacji:
- Interfejs profilu umożliwia edycję pola kontekstu użytkownika dla AI.
- Zmiany w profilu są zapisywane i wykorzystywane przy kolejnych operacjach generowania zadań.

US-009
Tytuł: Uwierzytelnianie i bezpieczny dostęp
Opis: Aplikacja wymaga logowania, aby zapewnić bezpieczeństwo danych użytkownika oraz dostęp do spersonalizowanych zadań. Proces uwierzytelniania gwarantuje, że tylko autoryzowani użytkownicy mają dostęp do swojego konta.
Kryteria akceptacji:
- System wymaga logowania przed uzyskaniem dostępu do głównych funkcjonalności.
- Dane sesji są przechowywane w sposób zapewniający bezpieczeństwo.
- Proces logowania i autoryzacji jest testowalny i odporny na nieautoryzowany dostęp.
- Użytkownicy mają dostęp wyłącznie do swoich własnych danych.

US-010
Tytuł: Obsługa błędu generowania zadania przez AI
Opis: W przypadku wystąpienia błędu podczas generowania opisu zadania przez AI, użytkownik otrzymuje komunikat "coś poszło nie tak, spróbuj ponownie później", a szczegóły błędu są logowane w systemie.
Kryteria akceptacji:
- Po wystąpieniu błędu wyświetlany jest komunikat informujący o niepowodzeniu operacji.
- System loguje informacje o błędzie: identyfikator użytkownika, czas wystąpienia, długość i hash oryginalnego opisu oraz dodatkowe dane diagnostyczne.

## 6. Metryki sukcesu
1. 90% użytkowników ma wypełnioną sekcję informacji osobistych w profilu.
2. 75% użytkowników generuje jeden lub więcej zadań TODO w ciągu tygodnia.
3. 70% użytkowników zaznacza jedno lub więcej zadań jako ukończone w ciągu tygodnia.
4. Wygenerowane zadania spełniają kryteria metodologii SMART.
5. System logowania błędów umożliwia szybkie wykrywanie i naprawę problemów. 