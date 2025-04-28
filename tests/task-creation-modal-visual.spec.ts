import { test, expect } from "@playwright/test";
import { TasksPage } from "../e2e/page-objects/TasksPage";

test.describe("Task Creation Modal Visual Testing", () => {
  test.beforeEach(async () => {
    // Authentication is handled by auth.setup.ts
  });

  test("should match the visual snapshot of the task creation modal", async ({ page }) => {
    // Arrange: Navigate to tasks page
    const tasksPage = new TasksPage(page);
    await tasksPage.goto();

    // Act: Open the task creation modal
    await tasksPage.clickAddTask();

    // Assert: The modal visually matches the expected snapshot
    await expect(page.getByTestId("task-creation-modal")).toHaveScreenshot("task-creation-modal.png");
  });

  test("should match the visual snapshot of the second step", async ({ page }) => {
    // Arrange: Navigate to tasks page
    const tasksPage = new TasksPage(page);
    await tasksPage.goto();

    // Act: Go through the first step of task creation
    await tasksPage.clickAddTask();
    await tasksPage.taskCreationModal.fillNote("testing visual snapshot");
    await tasksPage.taskCreationModal.clickGenerateDescription();

    // Assert: The second step matches the expected snapshot
    await expect(page.getByTestId("task-creation-modal")).toHaveScreenshot("task-creation-modal-step2.png");
  });
});
