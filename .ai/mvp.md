# Aplikacja - tpADHDo (MVP)

## Główny problem
Osoby z ADHD wrzucone są do społeczeństwa bez znajomości ani tego z czym się borykają, ani skutecznych narzędzi pomocnych w podnoszeniu jakości życia. Jednym z są odmienne podejście do realizacji zadań - standardowe listy TODO nie są efektywne, ponieważ nie zakładają problemów z przerzutnością uwagi, niechęcią do czekania na nagrodę, pseudoefektywnością (robieniem wszystkiego mniej ważnego, tylko nie tego co jest w tym momencie ważne - being busy, not productive).

Efektywnym narzędziem do realizacji celów długoterminowych jest lista ABC - lista w której zamiast kalendarza używa się 3 kategorii: 
* kategoria A (są najważniejsze, oznacza to, że mają krótki termin wykonania- dziś albo jutro),
* kategoria B (mniej ważne można je wykonać w dłuższym terminie)
* kategoria C (najmniej ważne, mogą się wydawać łatwe do wykonania, ale nie mają takiej wagi jak kategorie A i B).

Wszystkie zadania priorytetyzujemy na podstawie ważności - im ważniejsze, tym wyżej na liście.

Ważne, aby każda TODO miała jasno zdefiniowane cele SMART: Specific, Measurable, Achievable, Relevant, and Time-Bound. W przypadku ADHD nawet najmniejsza trudność sprawi, że dana strategia nie będzie efektywna w długim okresie czasu. W związku z tym proces tworzenia zadań powinien być jak najbardziej zautomatyzaowany. Użytwonik powinien dodać tylko krótką notatkę opisującą po krótce co ma być zrobione, a to AI powino w jego imieniu i na podstawie dodatkowego kontekstu zapisanego w profilu użytkownika wygenerować poprawny opis zadania zgodnie z metodologią SMART. 

### Najmniejszy zestaw funkcjonalności
- Zapisywanie, odczytywanie, przeglądanie i usuwanie zadań TODO w formie tekstowej
- Prosty system kont użytkowników do powiązania użytkownika z własnymi zadaniami
- Strona profilu użytkownika służąca do zapisywania informacji o użytkowniku przekazywanych jako kontekst do AI
- Integracja z AI umożliwiająca modyfikację zadań TODO wpisanych przez użytkownika z wykorzystaniem informacji o użytkowniku z wykorzystaniem metodyki SMART.
- zaznaczenie zadania TODO jako wykonanego
- zmiana kategorii zadania (A, B lub C), oraz jego miejsca w danej kategorii (priorytetu)

### Co NIE wchodzi w zakres MVP
- Bogata obsługa multimediów (np. zdjęć przepisów)
- Udostępnianie TODO dla innych użytkowników
- Funkcje społecznościowe
- organizacja zadań w projekty
- tagowanie TODO
- automatyczna przypisywanie priorytetów na dany dzień - użytkownik robi to manualnie.
- przypomnienia wykonania zadań
- statystki wykonanych zadań

### Kryteria sukcesu
- 90% użytkowników posiada wypełnioną sekcję informacji osobistych w swoim profilu
- 75% użytkowników generuje jeden lub więcej TODO w tygodniu
- 70% użytkowników zaznacza jeden lub więcej TODO jako ukończony w tygodniu