import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

/**
 * Retrieves the user's context data from the database.
 * Returns an empty string if no record exists.
 */
export async function getUserContext(supabase: SupabaseClient<Database>, userId: string): Promise<string> {
  const { data, error, status } = await supabase
    .from("user_context")
    .select("context_data")
    .eq("user_id", userId)
    .single();

  // If no record found, return empty context
  if (error && status === 406) {
    return "";
  }

  if (error) {
    throw error;
  }

  // Ensure type assertion for data
  const context = (data as { context_data: string } | null)?.context_data;
  return context ?? "";
}

/**
 * Inserts or updates the user's context data in the database.
 */
export async function updateUserContext(
  supabase: SupabaseClient<Database>,
  userId: string,
  contextData: string
): Promise<string> {
  const { data, error } = await supabase
    .from("user_context")
    .upsert({ user_id: userId, context_data: contextData }, { onConflict: "user_id" })
    .single();

  if (error) {
    throw error;
  }

  // Ensure type assertion for returned data
  if (!data) {
    return contextData;
  }

  return (data as { context_data: string }).context_data;
}
