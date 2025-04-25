import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  fullName?: string;
}

/**
 * Loguje użytkownika za pomocą Supabase Auth
 */
export async function loginUser(
  supabase: SupabaseClient<Database>,
  { email, password }: LoginDto
): Promise<ApiResponse<{ userId: string }>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || "auth/unknown-error",
          message: error.message || "An unknown error occurred during login",
        },
      };
    }

    return {
      success: true,
      data: {
        userId: data.user.id,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: {
        code: "auth/system-error",
        message: "An unexpected system error occurred",
      },
    };
  }
}

/**
 * Rejestruje nowego użytkownika za pomocą Supabase Auth
 */
export async function registerUser(
  supabase: SupabaseClient<Database>,
  { email, password, fullName }: RegisterDto
): Promise<ApiResponse<{ userId: string }>> {
  try {
    // Rejestracja użytkownika
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || "auth/unknown-error",
          message: error.message || "An unknown error occurred during registration",
        },
      };
    }

    return {
      success: true,
      data: {
        userId: data.user?.id || "",
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: {
        code: "auth/system-error",
        message: "An unexpected system error occurred",
      },
    };
  }
}

/**
 * Wylogowuje użytkownika
 */
export async function logoutUser(supabase: SupabaseClient<Database>): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || "auth/unknown-error",
          message: error.message || "An unknown error occurred during logout",
        },
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: {
        code: "auth/system-error",
        message: "An unexpected system error occurred",
      },
    };
  }
}
