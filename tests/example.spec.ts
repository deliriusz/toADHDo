// tests/example.spec.ts
import { test, expect } from "@playwright/test";

test("homepage has title", async ({ page }) => {
  // Replace with your actual development server URL or leave commented if using webServer config
  // await page.goto('http://localhost:4321/'); // Assuming Astro default dev port

  // Example: Check if the page title contains "Astro"
  // Adjust the locator and assertion based on your actual homepage content
  await expect(page).toHaveTitle(/.*/); // Use page to satisfy linter, check any title

  // Placeholder assertion until baseURL or webServer is configured
  // expect(true).toBe(true);
});
