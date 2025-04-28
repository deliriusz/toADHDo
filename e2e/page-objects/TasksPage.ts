import { type Page } from "@playwright/test";
import { TaskCreationModal } from "./TaskCreationModal";

export class TasksPage {
  private page: Page;
  readonly taskCreationModal: TaskCreationModal;

  constructor(page: Page) {
    this.page = page;
    this.taskCreationModal = new TaskCreationModal(page);
  }

  /**
   * Check if we're on the tasks page
   */
  async isOnTasksPage(): Promise<boolean> {
    // Check the URL
    const url = this.page.url();
    if (!url.includes("/tasks")) return false;

    // Check for the tasks heading
    const tasksHeading = await this.page.$('h1:has-text("Tasks")');
    return !!tasksHeading;
  }

  /**
   * Navigate to the tasks page
   */
  async goto() {
    await this.page.goto("/tasks");
    await this.page.waitForLoadState("networkidle");

    // Wait for the page heading to be visible
    await this.page.waitForSelector('h1:has-text("Tasks")', { state: "visible" });

    // Verify we're on the right page
    const onTasksPage = await this.isOnTasksPage();
    if (!onTasksPage) {
      throw new Error("Failed to navigate to tasks page. Current URL: " + this.page.url());
    }
  }

  /**
   * Click the Add Task button to open the creation modal
   */
  async clickAddTask() {
    // Verify we're on the tasks page first
    const onTasksPage = await this.isOnTasksPage();
    if (!onTasksPage) {
      throw new Error("Not on tasks page. Cannot click Add Task button. Current URL: " + this.page.url());
    }

    // Try multiple selector strategies
    const addTaskButton =
      (await this.page.$('[data-testid="add-task-button"]')) || (await this.page.$('button:has-text("Add Task")'));

    if (!addTaskButton) throw new Error("Add Task button not found");

    await addTaskButton.click();
    await this.taskCreationModal.waitForModalToBeVisible();
  }

  /**
   * Check if a task with the specified text exists in the table
   *
   * @param text - Text to search for in task descriptions
   * @returns - Promise resolving to a boolean indicating if the task exists
   */
  async taskExists(text: string): Promise<boolean> {
    // Wait for the table to be visible
    await this.page.waitForSelector('table, [data-testid="task-data-table"]', { state: "visible", timeout: 5000 });

    // Look for the text in the table
    const textElement = await this.page.$(`:text("${text}")`);
    return !!textElement;
  }

  /**
   * Wait for the task table to be updated after an operation
   */
  async waitForTableUpdate() {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForSelector('table, [data-testid="task-data-table"]', { state: "visible", timeout: 5000 });
  }
}
