// import { test, expect } from "@playwright/test";
// import { TasksPage } from "../e2e/page-objects/TasksPage";

// test.describe("Task Creation Flow", () => {
//   test.beforeEach(async () => {
//     // Page context is already authenticated via auth.setup.ts
//     // No need for manual login here
//   });

//   test("should create a new task using the multi-step creation modal", async ({ page }) => {
//     // Arrange: Set up page objects and navigate to tasks page
//     const tasksPage = new TasksPage(page);
//     await tasksPage.goto();

//     await page.waitForLoadState("networkidle");

//     // Act: Create a new task
//     await tasksPage.clickAddTask();
//     await tasksPage.taskCreationModal.fillNote("do laundry");
//     await tasksPage.taskCreationModal.selectCategory("A");
//     await tasksPage.taskCreationModal.clickGenerateDescription();
//     await tasksPage.taskCreationModal.clickCreateTask();

//     // Wait for the UI to update after task creation
//     await tasksPage.waitForTableUpdate();

//     // Assert: Verify the task was created successfully
//     const taskExists = await tasksPage.taskExists("do laundry");
//     expect(taskExists).toBeTruthy();
//   });

//   test("should create a new task using the simplified create method", async ({ page }) => {
//     // Arrange: Set up page objects and navigate to tasks page
//     const tasksPage = new TasksPage(page);
//     await tasksPage.goto();

//     // Act: Use the simplified task creation method
//     await tasksPage.clickAddTask();
//     await tasksPage.taskCreationModal.createTask("buy groceries", "A");

//     // Wait for the UI to update after task creation
//     await tasksPage.waitForTableUpdate();

//     // Assert: Verify the task was created successfully
//     const taskExists = await tasksPage.taskExists("buy groceries");
//     expect(taskExists).toBeTruthy();
//   });
// });
