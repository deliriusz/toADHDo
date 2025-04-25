import type { APIRoute } from "astro";
import { logoutUser } from "../../../lib/services/authService";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  try {
    // Wylogowanie użytkownika przy użyciu Supabase
    const response = await logoutUser(locals.supabase);

    if (!response.success) {
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Udane wylogowanie
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in logout endpoint:", error);

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
