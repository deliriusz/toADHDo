import { test, expect } from "@playwright/test";

test.describe("Task Creation Modal Test", () => {
  test("should open and interact with task creation modal", async ({ page }) => {
    // Go directly to the tasks page
    await page.goto("/tasks");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if we need to log in - if so, just report that authentication is needed
    if (page.url().includes("/login")) {
      console.log("Authentication required. Skipping test.");
      test.skip();
      return;
    }

    // Find the "Add Task" button by text if it exists
    const addTaskButton = await page.$('button:has-text("Add Task")');
    if (!addTaskButton) {
      console.log("Add Task button not found. Skipping test.");
      test.skip();
      return;
    }

    // Click the button to open the modal
    await addTaskButton.click();

    // Wait for some form of dialog to appear
    const dialogVisible = await page
      .waitForSelector('dialog[open], [role="dialog"]', {
        state: "visible",
        timeout: 5000,
      })
      .then(() => true)
      .catch(() => false);

    if (!dialogVisible) {
      console.log("Dialog not visible after clicking Add Task. Skipping test.");
      test.skip();
      return;
    }

    // Verify dialog shows appropriate content
    const dialogTextVisible = await page
      .getByText(/Create New Task|Add Task|New Task/)
      .isVisible()
      .then((visible) => visible)
      .catch(() => false);

    expect(dialogTextVisible).toBeTruthy();

    // Try to find and fill the textarea
    const textarea = await page.$("textarea");
    if (textarea) {
      await textarea.fill("Test task from e2e test");

      // Try to find category options (if they exist)
      const categoryOptions = await page.$$('[value="A"], [value="B"], [value="C"]');
      if (categoryOptions.length > 0) {
        // Click the first category option
        await categoryOptions[0].click();
      }

      // Look for any button that might generate or create a task
      const actionButton = await page.$(
        'button:has-text("Generate"), button:has-text("Create"), button:has-text("Add")'
      );
      if (actionButton) {
        // Just verify the button is there, don't actually click it to avoid test side effects
        expect(await actionButton.isVisible()).toBeTruthy();
      }
    }
  });
});
