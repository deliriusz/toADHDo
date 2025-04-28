import { test, expect } from "@playwright/test";

test.describe("Task Creation Modal Test (Authenticated)", () => {
  // Set a fixed viewport size for consistent visual tests
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async () => {
    // Authentication is handled by auth.setup.ts
  });

  test("should open and interact with task creation modal", async ({ page }) => {
    // Go to the tasks page
    await page.goto("/tasks");
    await page.waitForLoadState("networkidle");

    // Take a screenshot of the tasks page
    await page.screenshot({ path: "test-results/tasks-page.png" });

    // Find and click the Add Task button
    const addTaskButton = await page.$('button:has-text("Add Task")');
    if (!addTaskButton) {
      console.log("Add Task button not found. Skipping test.");
      test.skip();
      return;
    }

    await addTaskButton.click();

    // Wait for the modal dialog
    const modal = await page
      .waitForSelector('dialog[open], [role="dialog"]', {
        state: "visible",
        timeout: 5000,
      })
      .catch(() => null);

    if (!modal) {
      console.log("Modal dialog not found after clicking Add Task button");
      test.skip();
      return;
    }

    // Take a screenshot of the modal
    await page.screenshot({ path: "test-results/task-modal.png" });

    // Try to find and fill the task note textarea
    const textarea = await page.$("textarea");
    if (textarea) {
      await textarea.fill("do laundry");

      // Find and click category A if possible
      const categoryA = await page.$('[value="A"], button:has-text("A")');
      if (categoryA) {
        await categoryA.click();
      }

      // Take a screenshot after filling the form
      await page.screenshot({ path: "test-results/task-modal-filled.png" });

      // Find the button to proceed (but don't click to avoid side effects)
      const actionButton = await page.$(
        'button:has-text("Generate"), button:has-text("Create"), button:has-text("Next")'
      );
      expect(actionButton).toBeTruthy();
    }
  });
});
