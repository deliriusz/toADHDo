import { type Page } from "@playwright/test";
import { env } from "../utils/env";

export class LoginPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto("/login");
  }

  /**
   * Login with email and password
   *
   * @param email - User email (defaults to E2E_USERNAME from env)
   * @param password - User password (defaults to E2E_PASSWORD from env)
   */
  async login(email?: string, password?: string) {
    await this.page.getByTestId("email-input").fill(email || env.username);
    await this.page.getByTestId("password-input").fill(password || env.password);
    await this.page.getByTestId("login-button").click();
  }
}
