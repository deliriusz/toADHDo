import { type Page } from "@playwright/test";
import type { TaskCategory } from "../../src/types";

export class TaskCreationModal {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for the modal to be visible
   */
  async waitForModalToBeVisible() {
    // Wait for the modal dialog to be visible using multiple selector strategies
    await this.page.waitForSelector('[data-testid="task-creation-modal"], dialog[open], [role="dialog"]', {
      state: "visible",
      timeout: 5000,
    });
  }

  /**
   * Fill the note input in step 0
   *
   * @param text - The note text to enter
   */
  async fillNote(text: string) {
    await this.page.getByTestId("task-note-input").fill(text);
  }

  /**
   * Select a category in the toggle
   *
   * @param category - The category to select (A, B, or C)
   */
  async selectCategory(category: TaskCategory) {
    await this.page.getByTestId(`category-${category.toLowerCase()}-option`).click();
  }

  /**
   * Click the Generate Description button to proceed to step 1
   */
  async clickGenerateDescription() {
    await this.page.getByTestId("generate-description-button").click();
    // Wait for the step to change and the create task button to be visible
    await this.page.waitForSelector('[data-testid="create-task-button"], button:has-text("Accept & Create Task")', {
      state: "visible",
      timeout: 10000,
    });
  }

  /**
   * Click the Create Task button to finalize task creation
   */
  async clickCreateTask() {
    await this.page.getByTestId("create-task-button").click();
  }

  /**
   * Complete the entire task creation flow
   *
   * @param noteText - The note text to enter
   * @param category - The category to select
   */
  async createTask(noteText: string, category: TaskCategory = "B") {
    await this.waitForModalToBeVisible();
    await this.fillNote(noteText);
    await this.selectCategory(category);
    await this.clickGenerateDescription();
    await this.clickCreateTask();
  }
}
