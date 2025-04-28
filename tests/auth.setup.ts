import { test as setup } from "@playwright/test";
import path from "path";
import fs from "fs";

// Ensure the auth directory exists
const authDir = path.join(process.cwd(), "./playwright/.auth");
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

const authFile = path.join(authDir, "user.json");

setup("authenticate", async ({ page }) => {
  // Navigate to the login page
  await page.goto("/login");

  await page.waitForLoadState("networkidle");

  // Fill in login form with credentials from environment variables
  // These should be set in your .env.test file
  await page.getByTestId("email-input").fill(process.env.E2E_USERNAME || "test@example.com");
  await page.getByTestId("password-input").fill(process.env.E2E_PASSWORD || "password123");

  // Submit the login form
  await page.getByTestId("login-button").click();

  // Wait for navigation to complete after login
  await page.waitForURL("/tasks");

  // Optional: Verify we're logged in by checking for an element that only appears when authenticated
  // For example: await expect(page.locator(".user-profile")).toBeVisible();

  // Save the authentication state to a file for reuse in tests
  await page.context().storageState({ path: authFile });

  console.log(`Authentication state saved to ${authFile}`);
});
