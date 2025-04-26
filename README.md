# toADHDo (MVP)

## Table of Contents

- [Project Name](#project-name)
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Name

**toADHDo (MVP)**

## Project Description

toADHDo is a task management application designed specifically for individuals with ADHD. Unlike traditional to-do list apps, toADHDo leverages AI to transform brief user notes—augmented by additional profile context—into detailed, personalized task descriptions based on the SMART (Specific, Measurable, Achievable, Relevant, Time-Bound) methodology. The app provides functionalities for creating, editing, saving, viewing, and deleting tasks. It also enables users to categorize tasks (A, B, C), adjust their priority, and mark them as completed.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, authentication, and more)
- **AI Integration:** Openrouter.ai for accessing multiple AI models
- **Testing:**
  - Unit/Integration: Vitest, React Testing Library (RTL)
  - E2E: Playwright
- **CI/CD & Hosting:** GitHub Actions, DigitalOcean, Docker

## Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (Version specified in `.nvmrc`: **22.14.0**)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

In the project directory, you can run:

- **npm run dev**
  - Starts the local development server using Astro.
- **npm run build**
  - Builds the project for production.
- **npm run preview**
  - Previews the production build locally.
- **npm run astro**
  - Runs Astro CLI commands.
- **npm run lint**
  - Runs ESLint to analyze the code for potential issues.
- **npm run lint:fix**
  - Automatically fixes linting issues where possible.
- **npm run format**
  - Formats the code using Prettier.

## Project Scope

The MVP version of toADHDo includes the following features:

- **Task Creation:** Users can create tasks by entering a short note, which is then transformed by AI into a detailed, SMART-compliant task description.
- **Task Editing:** Users can edit and accept the AI-generated task descriptions.
- **Task Management:** Tasks can be saved, viewed, updated, and deleted.
- **Task Completion:** Users can mark tasks as completed. Completed tasks are timestamped.
- **Categorization & Priority:** Tasks can be organized into categories (A, B, C) with options to change their priority order.
- **User Authentication:** Secure login, registration, and profile management to support personalized task generation.
- **Error Handling:** Logging of AI task generation events and errors for improved diagnostics.

*Note: The MVP does not include multimedia support, social collaboration features, automatic reminders, or project-based task grouping.*

## Project Status

**MVP Stage:** This project is currently in the Minimum Viable Product stage. It is under active development and may undergo changes as new feedback is incorporated.

## License

This project is licensed under the MIT License.
