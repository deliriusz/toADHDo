import { type Page } from "@playwright/test";
import { env } from "../utils/env";

export class LoginPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Check if we're on the login page
   */
  async isOnLoginPage(): Promise<boolean> {
    // Check the URL
    const url = this.page.url();
    if (!url.includes("/login")) return false;

    // Check for the login form
    const form = await this.page.$("form");
    return !!form;
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    // Use a relative path with the leading slash to ensure it works with baseURL
    await this.page.goto("/login");

    // Ensure the page has loaded and key elements are visible
    await this.page.waitForLoadState("networkidle");

    // Wait for the form to be visible
    await this.page.waitForSelector("form", { state: "visible", timeout: 5000 }).catch(() => {
      console.error("Login form not found. Current URL:", this.page.url());
      throw new Error("Login form not found after navigation to /login");
    });
  }

  /**
   * Login with email and password
   *
   * @param email - User email (defaults to E2E_USERNAME from env)
   * @param password - User password (defaults to E2E_PASSWORD from env)
   */
  async login(email?: string, password?: string) {
    // Ensure we're on the login page
    const onLoginPage = await this.isOnLoginPage();
    if (!onLoginPage) {
      console.warn("Not on login page, navigating to login page first");
      await this.goto();
    }

    // Try multiple selector strategies - using either test ID or more reliable standard selectors
    const emailInput =
      (await this.page.$('[data-testid="email-input"]')) ||
      (await this.page.$('input[type="email"]')) ||
      (await this.page.$("#email"));

    const passwordInput =
      (await this.page.$('[data-testid="password-input"]')) ||
      (await this.page.$('input[type="password"]')) ||
      (await this.page.$("#password"));

    const loginButton =
      (await this.page.$('[data-testid="login-button"]')) || (await this.page.$('button[type="submit"]'));

    if (!emailInput) {
      console.error("Current page HTML:", await this.page.content());
      throw new Error("Email input not found");
    }
    if (!passwordInput) throw new Error("Password input not found");
    if (!loginButton) throw new Error("Login button not found");

    // Fill in the form
    await emailInput.fill(email || env.username);
    await passwordInput.fill(password || env.password);
    await loginButton.click();

    // Wait for navigation after login
    await this.page.waitForLoadState("networkidle");

    // Check if we're still on the login page (might indicate login failure)
    const stillOnLoginPage = await this.isOnLoginPage();
    if (stillOnLoginPage) {
      // Look for error messages
      const errorElement = await this.page.$('.text-rose-300, .text-red-500, [role="alert"]');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        throw new Error(`Login failed: ${errorText}`);
      } else {
        throw new Error("Login did not redirect to a different page. Check credentials.");
      }
    }
  }
}
