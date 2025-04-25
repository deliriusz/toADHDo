import { defineMiddleware } from "astro:middleware";
import { createSupabaseServer } from "../db/supabase.server";

// Ścieżki publiczne, które nie wymagają uwierzytelnienia
const PUBLIC_PATHS = [
  // Strony uwierzytelniania
  "/login",
  "/register",
  "/forgot-password",
  // Endpointy API uwierzytelniania
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Inicjalizacja Supabase
  const supabase = createSupabaseServer({ headers: request.headers, cookies });
  locals.supabase = supabase;

  // Sprawdzenie czy ścieżka jest publiczna
  const isPublicPath = PUBLIC_PATHS.some((path) => url.pathname === path);

  if (!isPublicPath) {
    // Sprawdzenie sesji użytkownika
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Zapisanie danych użytkownika do lokalnego kontekstu
      locals.user = {
        id: user.id,
        email: user.email,
      };
    } else if (url.pathname.startsWith("/tasks")) {
      // Przekierowanie do logowania jeśli użytkownik próbuje uzyskać dostęp do chronionych ścieżek
      return redirect("/login");
    }
  } else if (url.pathname === "/login" || url.pathname === "/register") {
    // Sprawdź czy użytkownik jest już zalogowany
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Przekierowanie zalogowanego użytkownika do głównej strony
      return redirect("/tasks");
    }
  }

  return next();
});
