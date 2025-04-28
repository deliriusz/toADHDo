// Playwright global teardown: cleans up Supabase tables after all tests for the test user
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";
import { test as teardown } from "@playwright/test";

// Load environment variables (ensure SUPABASE_URL, SUPABASE_KEY, and E2E_USERNAME_ID are set)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const E2E_USERNAME_ID = process.env.E2E_USERNAME_ID;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables.");
  process.exit(1);
}
if (!E2E_USERNAME_ID) {
  console.error("Missing E2E_USERNAME_ID in environment variables.");
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

teardown("authenticate", async () => {
  try {
    console.log(`Cleaning up test data for user_id: ${E2E_USERNAME_ID}`);
    // Delete from processing_log first due to FK constraint
    const { error: logError } = await supabase
      .from("processing_log")
      .delete()
      .eq("user_id", E2E_USERNAME_ID as string);
    if (logError) {
      console.error("Error deleting from processing_log:", logError.message);
    } else {
      console.log("All entries deleted from processing_log for test user.");
    }

    // Delete from task
    const { error: taskError } = await supabase
      .from("task")
      .delete()
      .eq("user_id", E2E_USERNAME_ID as string);
    if (taskError) {
      console.error("Error deleting from task:", taskError.message);
    } else {
      console.log("All entries deleted from task for test user.");
    }
  } catch (err) {
    console.error("Unexpected error during teardown:", err);
    process.exit(1);
  }
});
