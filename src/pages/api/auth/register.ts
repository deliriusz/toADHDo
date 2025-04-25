import type { APIRoute } from "astro";
import { z } from "zod";
import { registerUser } from "../../../lib/services/authService";

// Schemat walidacji dla danych rejestracji
const registerSchema = z
  .object({
    email: z.string().email("Proszę podać prawidłowy adres email"),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną dużą literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
    confirmPassword: z.string().min(8, "Proszę potwierdzić hasło"),
    fullName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parsowanie i walidacja danych wejściowych
    const body = await request.json();
    const result = registerSchema.safeParse(body);

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

    // Usunięcie confirmPassword z danych rejestracji
    const { confirmPassword: _, ...registerData } = result.data;

    // Rejestracja użytkownika przy użyciu Supabase
    const response = await registerUser(locals.supabase, registerData);

    if (!response.success) {
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Udana rejestracja
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in register endpoint:", error);

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
