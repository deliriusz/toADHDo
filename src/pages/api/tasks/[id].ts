import type { APIRoute } from "astro";
import { z } from "zod";
import type { UpdateTaskCommand, TaskCategory } from "../../../types";
import { getUser } from "@/lib/supabase-utils";

export const prerender = false;

const updateTaskSchema = z.object({
  priority: z.string().optional(),
  category: z.enum(["A", "B", "C"]).optional(),
  task_source: z.enum(["full-ai", "edited-ai", "edited-user"]).optional(),
  description: z.string().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

export const GET: APIRoute = async ({ params, locals }) => {
  const user = await getUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const taskId = params.id;
  if (!taskId) {
    return new Response(JSON.stringify({ error: "Task ID is required" }), { status: 400 });
  }

  try {
    const { data, error } = await locals.supabase
      .from("task")
      .select("*")
      .eq("id", parseInt(taskId, 10))
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Task not found", original: error }), { status: 404 });
      }
      throw error;
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const user = await getUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const taskId = params.id;
  if (!taskId) {
    return new Response(JSON.stringify({ error: "Task ID is required" }), { status: 400 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  let validated;
  try {
    validated = updateTaskSchema.parse(payload);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 400 });
  }

  // Transform category to uppercase if provided
  const updateData: UpdateTaskCommand = {
    ...validated,
    ...(validated.category && { category: validated.category as TaskCategory }),
  };

  try {
    const { data, error } = await locals.supabase
      .from("task")
      .update(updateData)
      .eq("id", parseInt(taskId, 10))
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Task not found", original: error }), { status: 404 });
      }
      throw error;
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = await getUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const taskId = params.id;
  if (!taskId) {
    return new Response(JSON.stringify({ error: "Task ID is required" }), { status: 400 });
  }

  try {
    const { error } = await locals.supabase.from("task").delete().eq("id", parseInt(taskId, 10)).eq("user_id", user.id);

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Task not found", original: error }), { status: 404 });
      }
      throw error;
    }

    return new Response(null, { status: 204 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 500 });
  }
};
