import type { APIRoute } from "astro";
import { z } from "zod";
import { loginUser, type LoginDto } from "../../../lib/services/authService";

// Schemat walidacji dla danych logowania
const loginSchema = z.object({
  email: z.string().email("Proszę podać prawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parsowanie i walidacja danych wejściowych
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "validation-error",
            message: result.error.issues[0]?.message || "Błąd walidacji danych",
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const loginData: LoginDto = result.data;

    // Logowanie użytkownika przy użyciu Supabase
    const response = await loginUser(locals.supabase, loginData);

    if (!response.success) {
      return new Response(JSON.stringify(response), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Udane logowanie
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in login endpoint:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "server-error",
          message: "Coś poszło nie tak, spróbuj ponownie później",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
