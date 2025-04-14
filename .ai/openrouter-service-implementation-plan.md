# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi
Usługa OpenRouter to moduł integracyjny, który umożliwia komunikację z API OpenRouter w celu uzupełnienia czatów opartych na modelach językowych LLM. Moduł odpowiada za:
- Budowę zapytań do API uwzględniających systemowy komunikat, komunikat użytkownika oraz zdefiniowany format odpowiedzi.
- Obsługę odpowiedzi od API, w tym walidację struktury danych oraz przetwarzanie błędów.
- Integrację z istniejącą architekturą opartą na Astro 5, React 19, TypeScript 5, Tailwind 4 oraz Shadcn/ui.

## 2. Opis konstruktora
Konstruktor modułu inicjalizuje kluczowe komponenty oraz przekazuje niezbędne parametry konfiguracji:
- **apiKey** – Klucz API do autoryzacji przy połączeniu z OpenRouter.
- **baseURL** – Bazowy URL endpointu OpenRouter API.
- **defaultModel** – Domyślna nazwa modelu (np. "gpt-4").
- **modelParams** – Parametry modelu, takie jak { temperature: 0.7, max_tokens: 500 }.
- **defaultSystemMessage** – Domyślny komunikat systemowy, np. "Jesteś ekspertem ds. wsparcia technicznego.".

## 3. Publiczne metody i pola
- **Metoda `sendChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>`**
  - Przyjmuje obiekt `ChatCompletionRequest` zawierający komunikaty (systemowy oraz użytkownika) oraz opcjonalne nadpisania parametrów.
  - Buduje zapytanie do API OpenRouter z uwzględnieniem wszystkich wymaganych elementów.
  - Obsługuje odpowiedź, waliduje strukturę danych (wg response_format) i zwraca wynik.
- **Pola konfiguracyjne**:
  - `openRouterConfig` – Zbiór ustawień niezbędnych do komunikacji z API.
  - `httpClient` – Instancja klienta HTTP odpowiedzialna za realizację zapytań.

## 4. Prywatne metody i pola
- **Metoda `buildRequestPayload(request: ChatCompletionRequest): RequestPayload`**
  - Buduje strukturę zapytania uwzględniając:
    1. **Komunikat systemowy:** np. "Jesteś ekspertem ds. wsparcia technicznego."
    2. **Komunikat użytkownika:** np. "Jak mogę skonfigurować usługę OpenRouter?"
    3. **Response Format:**
       ```json
      {
       "type": "json_schema",
       "json_schema": {
         "name": "TODO",
         "strict": true,
         "schema": {
           "type": "object",
           "properties": {
             "text": {
               "type": "string",
               "description": "TODO description updated by AI"
             },
             "tags": {
               "type": "array",
               "description": "List of tags detected by the AI",
               "items": {
                  "type": "string"
               }
             }
           },
           "required": ["text", "tags"],
           "additionalProperties": false
         }
       }
     }
       ```
    4. **Nazwa modelu:** np. "gpt-4o-mini".
    5. **Parametry modelu:** np. `{ "temperature": 0.7, "max_tokens": 500 }`.
- **Metoda `parseResponse(response: any): ChatCompletionResponse`**
  - Waliduje odpowiedź względem zdefiniowanego `response_format`.
  - Mapuje dane na wewnętrzne struktury aplikacji.
- **Pola prywatne:**
  - `httpClientInstance` – Instancja klienta do realizacji zapytań HTTP.
  - `schemaValidator` – Narzędzie do walidacji odpowiedzi według JSON Schema.

## 5. Obsługa błędów
Potencjalne scenariusze błędów i podejścia do ich obsługi:
1. **NetworkError** – Błąd połączenia lub timeout.
   - *Rozwiązanie:* Implementacja mechanizmu ponownych prób (retry) z wykładniczym wzrostem opóźnienia.
2. **APIError** – Błędy zwracane przez API (np. statusy 4xx lub 5xx).
   - *Rozwiązanie:* Rejestrowanie błędów, analiza kodów statusu i wywołanie procedury failsafe.
3. **ValidationError** – Odpowiedź niezgodna z zadeklarowanym `response_format`.
   - *Rozwiązanie:* Walidacja odpowiedzi przed dalszym przetwarzaniem i zgłaszanie błędu w ustrukturyzowany sposób.
4. **TimeoutError** – Przekroczenie czasu oczekiwania na odpowiedź.
   - *Rozwiązanie:* Ustawienie limitów czasowych i odpowiednich komunikatów błędów.

## 6. Kwestie bezpieczeństwa
- **Bezpieczne przechowywanie API Key:** Wykorzystanie zmiennych środowiskowych oraz systemów zarządzania sekretami.
- **Szyfrowanie transmisji danych:** Wymuszenie połączeń HTTPS dla wszystkich zapytań do API.
- **Bezpieczne logowanie:** Maskowanie danych wrażliwych przy logowaniu, aby nie były one dostępne w logach.
- **Walidacja danych:** Używanie TypeScript oraz JSON Schema do zabezpieczenia wejść i wyjść.

## 7. Plan wdrożenia krok po kroku
1. **Przygotowanie konfiguracji i środowiska**
   - Utworzenie pliku konfiguracyjnego zawierającego zmienne środowiskowe (API Key, baseURL, defaultModel, modelParams).
   - Instalacja niezbędnych zależności, jak klient HTTP oraz biblioteki do walidacji (np. Ajv).
2. **Implementacja modułu API Client**
   - Utworzenie modułu odpowiedzialnego za inicjalizację połączenia HTTP (np. przy użyciu fetch lub axios).
   - Dodanie konfiguracji globalnej oraz mechanizmów retry w przypadku błędów sieciowych.
3. **Budowa Request Builder**
   - Implementacja metody `buildRequestPayload`:
     - Włączenie komunikatu systemowego (np. "Jesteś ekspertem ds. wsparcia technicznego.").
     - Włączenie komunikatu użytkownika (np. "Jak mogę skonfigurować usługę OpenRouter?").
     - Definicja `response_format` zgodnie z wzorem:
       `{ type: 'json_schema', json_schema: { name: 'ChatResponse', strict: true, schema: { answer: 'string', metadata: 'object' } } }`
     - Ustawienie nazwy modelu (np. "gpt-4") oraz parametrów modelu (np. `{ temperature: 0.7, max_tokens: 500 }`).
4. **Implementacja Response Handler**
   - Utworzenie metody `parseResponse` odpowiedzialnej za walidację oraz mapowanie odpowiedzi API.
   - Obsługa przypadków, w których odpowiedź nie spełnia ustalonego formatu.
5. **Integracja warstwy obsługi błędów**
   - Zaimplementowanie try-catch wokół krytycznych operacji.
   - Dodanie mechanizmów ponownych prób (retry) oraz logowania błędów zgodnie z polityką bezpieczeństwa.
7. **Integracja z interfejsem użytkownika**
   - Wykorzystanie istniejących komponentów Astro/React do wywołania nowej usługi OpenRouter.
   - Zapewnienie responsywności interfejsu na stany: ładowanie, błąd oraz sukces.