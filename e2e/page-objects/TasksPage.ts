import { type Page, expect } from "@playwright/test";
import { TaskCreationModal } from "./TaskCreationModal";

export class TasksPage {
  private page: Page;
  readonly taskCreationModal: TaskCreationModal;

  constructor(page: Page) {
    this.page = page;
    this.taskCreationModal = new TaskCreationModal(page);
  }

  /**
   * Navigate to the tasks page
   */
  async goto() {
    await this.page.goto("/tasks");
  }

  /**
   * Click the Add Task button to open the creation modal
   */
  async clickAddTask() {
    await this.page.getByTestId("add-task-button").click();
    await this.taskCreationModal.waitForModalToBeVisible();
  }

  /**
   * Check if a task with the specified text exists in the table
   *
   * @param text - Text to search for in task descriptions
   * @returns - Promise resolving to a boolean indicating if the task exists
   */
  async taskExists(text: string): Promise<boolean> {
    // First ensure the table is visible
    await expect(this.page.getByTestId("task-data-table")).toBeVisible();
    // Check if text exists in any task description
    return await this.page.getByText(text).isVisible();
  }

  /**
   * Wait for the task table to be updated after an operation
   */
  async waitForTableUpdate() {
    await this.page.waitForLoadState("networkidle");
    await expect(this.page.getByTestId("task-data-table")).toBeVisible();
  }
}
