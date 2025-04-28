/**
 * Utility for accessing environment variables with validation
 */
export const env = {
  /**
   * Returns the e2e test username from environment variables
   * @throws Error if the environment variable is not set
   */
  get username(): string {
    const username = process.env.E2E_USERNAME;
    if (!username) {
      throw new Error("E2E_USERNAME environment variable is not set. Please check your .env.test file.");
    }
    return username;
  },

  /**
   * Returns the e2e test password from environment variables
   * @throws Error if the environment variable is not set
   */
  get password(): string {
    const password = process.env.E2E_PASSWORD;
    if (!password) {
      throw new Error("E2E_PASSWORD environment variable is not set. Please check your .env.test file.");
    }
    return password;
  },
};
