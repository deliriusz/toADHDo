import type { APIRoute } from "astro";
import { profileSchema } from "@/lib/schemas/profile";
import { getUserContext, updateUserContext } from "@/lib/services/profileService";
import { getUser } from "@/lib/supabase-utils";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  // Ensure authenticated
  const user = await getUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const context_data = await getUserContext(locals.supabase, user.id);
    return new Response(JSON.stringify({ context_data }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = await getUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }

  // Validate input
  let input;
  try {
    input = profileSchema.parse(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Validation failed";
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }

  try {
    const context_data = await updateUserContext(locals.supabase, user.id, input.context_data);
    if (context_data === undefined || context_data === null) {
      console.error("Error: context_data is undefined or null after updateUserContext");
      return new Response(JSON.stringify({ error: "Failed to update user context" }), { status: 500 });
    }
    return new Response(JSON.stringify({ context_data }), { status: 200 });
  } catch (err: unknown) {
    console.error("Error updating user context:", err);
    const message = err instanceof Error ? err.message : "Database error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
