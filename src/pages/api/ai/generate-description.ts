import { z } from "zod";
import type { APIRoute } from "astro";
import { getUser } from "@/lib/supabase-utils";
import { OpenRouterService } from "@/lib/openrouter.service";

// Get OpenRouter API key from environment variables
const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;

export const prerender = false;

// Validation schema for request body
const generateDescriptionSchema = z.object({
  description: z.string().min(1, "Description is required").max(2000, "Description must be less than 2000 characters"),
  userContext: z.string().optional().default(""), // Optional user context information
});

export const POST: APIRoute = async ({ request, locals }) => {
  // Check that the user is authenticated
  const user = await getUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Parse and validate request body
  let payload;
  try {
    payload = await request.json();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 400 });
  }

  let validated;
  try {
    validated = generateDescriptionSchema.parse(payload);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 400 });
  }

  const { description, userContext } = validated;

  try {
    // Create a dummy task_id for now as we don't have a real task yet
    // In a real scenario, we would either create a task or use an existing one
    const dummyTaskId = 1; // This would be replaced with a real task ID

    // Create processing log entry
    const startTime = Date.now();
    const { error: logError } = await locals.supabase.from("processing_log").insert({
      user_id: user.id,
      task_id: dummyTaskId, // Required field
      status: 1, // Using numeric status (1 = processing)
      processing_time: 0, // Will be updated after completion
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (logError) {
      throw logError;
    }

    // Initialize OpenRouter service
    if (!OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is not configured");
    }

    const openRouterService = new OpenRouterService({
      apiKey: OPENROUTER_API_KEY,
      defaultSystemMessage:
        "You are an AI assistant that helps improve task descriptions for people with ADHD. Make the descriptions clear, actionable, and easy to understand. Include appropriate tags for categorization.",
    });

    // Call OpenRouter service with the description
    const userMessage = `Task description: ${description}\n${userContext ? `Additional context: ${userContext}` : ""}`;

    // Process the description using OpenRouter service
    const aiResponse = await openRouterService.sendChatCompletion({
      userMessage,
      modelParams: {
        temperature: 0.7,
        max_tokens: 5000,
      },
    });

    // Calculate processing time
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Update the processing log with the completed status and actual processing time
    const { error: updateError } = await locals.supabase
      .from("processing_log")
      .update({
        status: 2, // Using numeric status (2 = completed)
        processing_time: processingTime,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (updateError) {
      console.error("Error updating processing log:", updateError);
      // Continue with the response even if updating the log fails
    }

    return new Response(
      JSON.stringify({
        generatedDescription: aiResponse.text,
        tags: aiResponse.tags,
      }),
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    // Update processing log with error status if possible
    try {
      await locals.supabase
        .from("processing_log")
        .update({
          status: 3, // Using numeric status (3 = error)
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
    } catch (logError) {
      console.error("Error updating processing log with error status:", logError);
    }

    return new Response(JSON.stringify({ error: errorMessage, original: err }), { status: 500 });
  }
};
