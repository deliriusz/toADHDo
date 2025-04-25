import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateTaskCommand, TaskCategory } from "../../../types";
import { getUser } from "@/lib/supabase-utils";
import { lexoRankToString, stringToLexoRank } from "@/lib/lexorank-utils";

export const prerender = false;

// Define the LexoRank interface locally since it's not exported
interface LexoRank {
  bucket: 0 | 1 | 2;
  rank: string;
  marker: 0 | 1 | 2;
}

const getQuerySchema = z.object({
  page: z
    .string()
    .transform((val: string) => parseInt(val))
    .optional(),
  limit: z
    .string()
    .transform((val: string) => parseInt(val))
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
  "filter[category]": z
    .string()
    .transform((val) => val.toUpperCase() as TaskCategory)
    .optional(),
  "filter[completed]": z
    .string()
    .transform((val) => val.toLowerCase() === "true")
    .optional(),
  "filter[description]": z.string().optional(),
});

const postBodySchema = z.object({
  priority: z.string().optional(),
  category: z.enum(["A", "B", "C"]).transform((value) => value.toUpperCase() as TaskCategory),
  task_source: z.enum(["full-ai", "edited-ai", "edited-user"]),
  description: z.string(),
});

// Create a function to get the next LexoRank for a new task
async function getNextLexoRank(
  locals: App.Locals,
  userId: string,
  category?: TaskCategory,
  placing: "top" | "bottom" = "bottom"
): Promise<string> {
  // Start building the query
  let query = locals.supabase.from("task").select("priority").eq("user_id", userId);

  // Add category filter if provided
  if (category) {
    query = query.eq("category", category);
  }

  // Set the ordering based on placing parameter
  query = query.order("priority", { ascending: placing === "top" });

  // Get the first task in the requested order
  const { data, error } = await query.limit(1).single();

  // If no tasks exist or the query returned an error, return the initial LexoRank
  if (error || !data || !data.priority) {
    // Initial LexoRank with a proper format
    return "0|aaaa:1";
  }

  // Calculate the next LexoRank
  try {
    if (placing === "top") {
      // For top placement, we need to create a rank that comes before the first one
      // We can't use an empty string directly because stringToLexoRank expects a valid format
      // Instead, create a LexoRank object directly with a rank before the first character
      const firstRank = stringToLexoRank(data.priority);

      // Create a rank that's lexicographically smaller
      const newRank: LexoRank = {
        bucket: firstRank.bucket,
        rank: "a" + firstRank.rank, // Prefix with 'a' to ensure it sorts before
        marker: firstRank.marker,
      };

      return lexoRankToString(newRank);
    } else {
      // For bottom placement, create a rank after the last one
      const lastRank = stringToLexoRank(data.priority);

      // Create a rank that's lexicographically larger
      const newRank: LexoRank = {
        bucket: lastRank.bucket,
        rank: lastRank.rank + "z", // Append 'z' to ensure it sorts after
        marker: lastRank.marker,
      };

      return lexoRankToString(newRank);
    }
  } catch (err) {
    // If there's any error in the LexoRank calculation, use a safe default
    console.error("Error calculating LexoRank:", err);
    return "0|aaaa:1";
  }
}

export const GET: APIRoute = async ({ url, locals }) => {
  // Check that the user is authenticated
  const user = await getUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const queryParams = Object.fromEntries(url.searchParams.entries());
  console.log(queryParams);
  console.log("pRSE INT: ", parseInt("1", 2));
  let validated;
  try {
    validated = getQuerySchema.parse(queryParams);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 400 });
  }

  console.log(url, "validated: ", validated);

  const page = validated.page ?? 1;
  const limit = validated.limit ?? 10;
  const start = (page - 1) * limit;
  const end = page * limit - 1;

  console.log(start, end);

  try {
    let query = locals.supabase
      .from("task")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("priority", { ascending: validated.order === "asc" })
      .range(start, end);

    if (validated["filter[category]"]) {
      query = query.eq("category", validated["filter[category]"] as TaskCategory);
    }

    if (validated["filter[completed]"] !== undefined) {
      const completedValue = validated["filter[completed]"] === true;
      query = completedValue ? query.not("completed_at", "is", null) : query.is("completed_at", null);
    }

    if (validated["filter[description]"]) {
      // Using full text search with English configuration
      // plainto_tsquery handles converting raw text to a tsquery safely, avoiding syntax errors
      // to_tsvector creates a document vector from the description text
      query = query.textSearch("description", validated["filter[description]"], {
        type: "plain",
        config: "english",
      });
    }

    const { data, error, count } = await query;

    if (error) {
      // If the error is not a PGRST103 - requested range not satisfiable, throw the error
      // Otherwise, continue - response payload will be empty
      if (error.code !== "PGRST103") {
        throw error;
      }
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
    priority: validated.priority || "", // Default empty string to be replaced
  };

  try {
    if (!taskData.priority) {
      // Get the next LexoRank value if none provided
      taskData.priority = await getNextLexoRank(locals, user.id, taskData.category, "bottom");
    }

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
