# Backend Authentication Integration Plan

Below is a detailed step-by-step plan for integrating Astro and Supabase Auth backend authentication, according to the Specification (`auth-spec.md`), PRD requirements, and best practices for Astro/React.

## 1. Installation and Configuration of Packages

- Install dependencies:
  ```bash
  npm install @supabase/ssr @supabase/supabase-js zod @hookform/resolvers
  ```
- Ensure that `.env` and `.env.example` files contain:
  ```env
  SUPABASE_URL=...
  SUPABASE_KEY=...
  ```
- Update `src/env.d.ts` with new environment variables:
  ```ts
  interface ImportMetaEnv {
    readonly SUPABASE_URL: string;
    readonly SUPABASE_KEY: string;
  }
  ```

## 2. Creating Supabase Server (SSR)

1. Add `src/db/supabase.server.ts` file:
   ```ts
   import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
   import type { Database } from "./database.types";

   const cookieOptions: CookieOptionsWithName = {
     path: "/",
     secure: true,
     httpOnly: true,
     sameSite: "lax",
   };

   export function createSupabaseServer(context: {
     headers: Headers;
     cookies: import('astro').AstroCookies;
   }) {
     return createServerClient<Database>(
       import.meta.env.SUPABASE_URL!,
       import.meta.env.SUPABASE_KEY!,
       {
         cookieOptions,
         cookies: {
           getAll: () => /* parse from context.headers */,
           setAll: cookiesToSet => /* write to context.cookies */,
         },
       },
     );
   }
   ```

## 3. Extending Middleware (`src/middleware/index.ts`)

- Define a list of public paths (`PUBLIC_PATHS`):
  - `/login`, `/register`, `/forgot-password`
  - `/api/auth/*`
- In `onRequest`:
  1. If `url.pathname` is public, attach SSR-instance Supabase to `context.locals.supabase`.
  2. Otherwise:
     ```ts
     const supabase = createSupabaseServer({ headers: request.headers, cookies });
     context.locals.supabase = supabase;
     const { data: { user } } = await supabase.auth.getUser();
     if (user) context.locals.user = { id: user.id };
     else if (url.pathname.startsWith('/tasks')) return redirect('/login');
     // protected: /tasks/**
     ```
  3. Ensure redirect of logged-in user from `/login` and `/register` to `/tasks`.

## 4. Astro Layouts

- `src/layouts/AuthLayout.astro` – common structure for registration/login pages.
- `src/layouts/MainLayout.astro` – session-protected navigation (links to `/tasks`, `/profile`, logout button).

## 5. Astro Pages

- `src/pages/login.astro` and `src/pages/register.astro` – each uses `AuthLayout.astro` and loads the appropriate React form component (with `client:load`).
- `src/pages/tasks/index.astro` – protected page; uses `MainLayout.astro` and fetches `Astro.locals.user.id` to load tasks.

## 6. Authorization Service (`src/lib/services/authService.ts`)

- Functions:
  - `registerUser(supabase, dto: RegisterDto)`
  - `loginUser(supabase, dto: LoginDto)`
  - `logoutUser(supabase)`
- Mapping Supabase errors to a unified `ApiResponse<T>` structure.

## 7. API Endpoints (`src/pages/api/auth`)

For each: `register.ts`, `login.ts`, `logout.ts`:

1. Method: `POST`
2. Parsing and validation of the request using Zod (`RegisterDto`/`LoginDto`).
3. Calling the appropriate function from `authService`.
4. Returning JSON according to `ApiResponse<T>` and the appropriate HTTP code (200/400/401).

## 8. React Forms

- `LoginForm.tsx`:
  - Use `fetch('/api/auth/login')`.
  - Handle response of type `ApiResponse<...>`:
    - `success === true` → `window.location.href = '/tasks'`
    - `success === false` → display `error.message` in `<Alert variant="destructive">`.
- Create a similar `RegisterForm.tsx` with an additional password confirmation field.

## 9. Logout Component (`src/components/ui/LogoutButton.tsx`)

- Buttons call `POST /api/auth/logout`, on success redirect `window.location.href = '/login'`.

## 10. Verification and Manual Testing

- Verify that an unauthenticated user trying to access `/tasks/**` is redirected to `/login`.
- Verify redirect of logged-in user from `/login`/`/register` to `/tasks`.
- Validate forms, display Zod validation errors and server messages.
- Test registration and login scenarios, redirects with `?registered=true` parameter and the logout button functionality.

---

> Plan prepared according to `auth-spec.md`, PRD requirements, and best practices for Astro 5, React 19, TypeScript 5, and Supabase Auth.