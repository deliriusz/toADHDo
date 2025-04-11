import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateTaskCommand, TaskCategory } from "../../../types";
import { getUser } from "@/lib/supabase-utils";

export const prerender = false;

const getQuerySchema = z.object({
  page: z
    .string()
    .transform((val: string) => parseInt(val, 1))
    .optional(),
  limit: z
    .string()
    .transform((val: string) => parseInt(val, 10))
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
  "filter[category]": z
    .string()
    .transform((val) => val.toUpperCase() as TaskCategory)
    .optional(),
  "filter[completed]": z.boolean().optional(),
});

const postBodySchema = z.object({
  priority: z.number(),
  category: z.enum(["A", "B", "C"]).transform((value) => value.toUpperCase() as TaskCategory),
  task_source: z.enum(["full-ai", "edited-ai", "edited-user"]),
  description: z.string(),
});

export const GET: APIRoute = async ({ url, locals }) => {
  // Check that the user is authenticated
  const user = await getUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const queryParams = Object.fromEntries(url.searchParams.entries());
  let validated;
  try {
    validated = getQuerySchema.parse(queryParams);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 400 });
  }

  const page = validated.page ?? 1;
  const limit = validated.limit ?? 10;
  const start = (page - 1) * limit;
  const end = page * limit - 1;

  try {
    let query = locals.supabase
      .from("task")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: validated.order === "asc" })
      .range(start, end);

    if (validated["filter[category]"]) {
      query = query.eq("category", validated["filter[category]"] as TaskCategory);
    }
    if (validated["filter[completed]"]) {
      const completedValue = validated["filter[completed]"] === true;
      query = query.eq("completed", completedValue);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const responsePayload = {
      data: data || [],
      meta: {
        total: count || 0,
        page,
        limit,
      },
    };

    return new Response(JSON.stringify(responsePayload), { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  // Check that the user is authenticated
  const user = await getUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 400 });
  }

  let validated;
  try {
    validated = postBodySchema.parse(payload);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 400 });
  }

  // Transform category from uppercase to lowercase before insertion
  const taskData: CreateTaskCommand = {
    ...validated,
    category: validated.category as CreateTaskCommand["category"],
  };

  try {
    const { data, error } = await locals.supabase
      .from("task")
      .insert([{ ...taskData, user_id: user.id }])
      .single();

    if (error) {
      throw error;
    }
    return new Response(JSON.stringify(data), { status: 201 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 500 });
  }
};
