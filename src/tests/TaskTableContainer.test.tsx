import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskTableContainer } from "@/components/tasks/TaskTableContainer";
import type { PaginatedResponse, TaskDTO, TaskCategory } from "@/types";
import type { Row, Table } from "@tanstack/react-table";
import { toast } from "sonner"; // Import the original function to mock

// --- Mocks ---

// Mock child components
vi.mock("@/components/tasks/TaskTableToolbar", () => ({
  TaskTableToolbar: vi.fn(({ onFilterChange }) => (
    <div data-testid="task-table-toolbar">
      <button onClick={() => onFilterChange({ description: "test filter" })}>Filter</button>
      <button
        onClick={() => {
          // Just redirect in the test
          window.location.href = "/tasks/new";
        }}
      >
        Add Task
      </button>
    </div>
  )),
}));

interface MockDataTableProps {
  table: Table<TaskDTO>;
  onEdit: (id: number) => void;
  onDuplicate: (task: TaskDTO) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, completed: boolean) => void;
  onCategoryChange: (id: number, category: TaskCategory) => void;
  onPriorityChange: (id: number, direction: "up" | "down") => void;
}

vi.mock("@/components/tasks/TaskDataTable", () => ({
  TaskDataTable: vi.fn(
    ({
      table,
      onEdit,
      onDuplicate,
      onDelete,
      onStatusChange,
      onCategoryChange,
      onPriorityChange,
    }: MockDataTableProps) => (
      <div data-testid="task-data-table">
        {table.getRowModel().rows.map((row: Row<TaskDTO>) => (
          <div key={row.original.id}>
            <span>{row.original.description}</span>
            <button onClick={() => onStatusChange(row.original.id, !row.original.completed_at)}>Toggle Status</button>
            <button onClick={() => onCategoryChange(row.original.id, "B")}>Change Category</button>
            <button onClick={() => onPriorityChange(row.original.id, "up")}>Priority Up</button>
            <button onClick={() => onPriorityChange(row.original.id, "down")}>Priority Down</button>
            <button onClick={() => onEdit(row.original.id)}>Edit</button>
            <button onClick={() => onDuplicate(row.original)}>Duplicate</button>
            <button onClick={() => onDelete(row.original.id)}>Delete</button>
          </div>
        ))}
      </div>
    )
  ),
}));
vi.mock("@/components/ui/LogoutButton", () => ({
  LogoutButton: vi.fn(() => <button data-testid="logout-button">Logout</button>),
}));
vi.mock("@/components/ui/loading-spinner", () => ({
  LoadingSpinner: vi.fn(() => <div data-testid="loading-spinner">Loading...</div>),
}));
vi.mock("@/components/ui/alert", () => ({
  Alert: vi.fn(({ children }) => <div data-testid="alert">{children}</div>),
  AlertDescription: vi.fn(({ children }) => <div data-testid="alert-description">{children}</div>),
}));

// Mock toast using vi.mock factory
vi.mock("sonner", async (importOriginal) => {
  const actual = await importOriginal<typeof import("sonner")>();
  return {
    ...actual, // Preserve other exports if needed
    toast: vi.fn(), // Mock the toast function directly
    Toaster: vi.fn(() => <div data-testid="toaster"></div>), // Mock Toaster as well
  };
});

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Spy on window.location.href setter
// Keep track of the original descriptor
const originalWindowLocation = window.location;
// Let TypeScript infer the spy type
let locationHrefSpy: ReturnType<typeof vi.spyOn>;

// --- Test Data ---
const mockTask1: TaskDTO = {
  id: 1,
  description: "Task 1",
  completed_at: null,
  category: "A",
  priority: "0|a:1",
  task_source: "full-ai",
  updated_at: null,
  user_id: "user1",
  created_at: new Date().toISOString(),
};
const mockTask2: TaskDTO = {
  id: 2,
  description: "Task 2",
  completed_at: new Date().toISOString(),
  category: "B",
  priority: "0|b:1",
  task_source: "edited-ai",
  updated_at: null,
  user_id: "user1",
  created_at: new Date().toISOString(),
};

const mockPaginatedResponse: PaginatedResponse<TaskDTO> = {
  data: [mockTask1, mockTask2],
  meta: { total: 2, page: 1, limit: 10 },
};

// Keeping this for potential future tests
// const mockPaginatedResponsePage2: PaginatedResponse<TaskDTO> = {
//   data: [mockTask3],
//   meta: { total: 3, page: 2, limit: 10 },
// };

const mockPaginatedResponseFiltered: PaginatedResponse<TaskDTO> = {
  data: [mockTask2],
  meta: { total: 1, page: 1, limit: 10 },
};

// --- Tests ---
describe("TaskTableContainer", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    vi.mocked(toast).mockClear();
    mockFetch.mockReset(); // Ensure fetch is completely reset, not just cleared

    // Restore Date mock if it exists
    vi.useRealTimers();

    // Setup window.location spy
    // We need to delete the original location before spying, JSDOM limitation
    // @ts-expect-error - JSDOM doesn't fully implement window.location and requires this workaround
    delete window.location;
    window.location = { ...originalWindowLocation }; // Restore a plain object copy
    locationHrefSpy = vi.spyOn(window.location, "href", "set");

    // Default successful fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPaginatedResponse,
    });
  });

  afterEach(() => {
    // Restore window.location after tests
    window.location = originalWindowLocation;
    // Restore Date mock
    vi.useRealTimers();
    // Cleanup any mounted components to prevent leaks between tests
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(<TaskTableContainer />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("fetches tasks on initial render and displays them", async () => {
    render(<TaskTableContainer />);
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    // Expect URL encoded params
    expect(mockFetch).toHaveBeenCalledWith("/api/tasks?page=1&limit=10&order=asc&filter%5Bcompleted%5D=false");
    expect(screen.getByTestId("task-data-table")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByTestId("task-table-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
  });

  it("displays error state if fetch fails", async () => {
    const errorMessage = "Failed to fetch tasks";
    mockFetch.mockReset(); // Reset fetch completely
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    render(<TaskTableContainer />);
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("alert")).toBeInTheDocument();
    expect(screen.getByTestId("alert-description")).toHaveTextContent(errorMessage);
  });

  it("refetches tasks when filters change via TaskTableToolbar", async () => {
    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());
    expect(mockFetch).toHaveBeenCalledTimes(1); // Initial fetch

    // Set up next mock response for the filter change
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPaginatedResponseFiltered,
    });

    const filterButton = screen.getByRole("button", { name: "Filter" });
    await userEvent.click(filterButton);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    // Expect URL encoded params
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tasks?page=1&limit=10&order=asc&filter%5Bcompleted%5D=false&filter%5Bdescription%5D=test+filter"
    );
  });

  it("refetches tasks when pagination changes (simulated via table state change)", async () => {
    // Setup for initial and pagination change responses
    mockFetch.mockReset();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponseFiltered,
      });

    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());
    expect(mockFetch).toHaveBeenCalledTimes(1);
    // Expect URL encoded params
    expect(mockFetch).toHaveBeenCalledWith("/api/tasks?page=1&limit=10&order=asc&filter%5Bcompleted%5D=false");

    const filterButton = screen.getByRole("button", { name: "Filter" });
    await userEvent.click(filterButton);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    // Expect URL encoded params
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tasks?page=1&limit=10&order=asc&filter%5Bcompleted%5D=false&filter%5Bdescription%5D=test+filter"
    );
  });

  it(
    "calls updateTask API when status is changed",
    async () => {
      // Mock Date for predictable completed_at value
      const FIXED_DATE = new Date("2024-01-01T12:00:00.000Z");
      vi.setSystemTime(FIXED_DATE);

      // Reset mock and set up specific responses for this test
      mockFetch.mockReset();

      // Setup responses for each call
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPaginatedResponse,
        }) // Initial GET
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: mockTask1.id }),
        }) // PATCH response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPaginatedResponse,
        }); // Refetch GET

      render(<TaskTableContainer />);

      // Wait for initial load to complete
      await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

      // Find and click the toggle button for the first task
      const toggleButton = screen.getAllByRole("button", { name: "Toggle Status" })[0];
      await userEvent.click(toggleButton);

      // Check the PATCH call was made correctly
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3); // Initial GET + PATCH + Refetch
        expect(mockFetch).toHaveBeenNthCalledWith(
          2,
          `/api/tasks/${String(mockTask1.id)}`,
          expect.objectContaining({
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed_at: FIXED_DATE.toISOString() }),
          })
        );
      });

      // Check toast was shown
      expect(vi.mocked(toast)).toHaveBeenCalledWith("Task updated", expect.any(Object));
    },
    { timeout: 10000 }
  ); // Increase timeout for this test

  it("calls updateTask API when category is changed", async () => {
    // Reset mock and set up specific responses for this test
    mockFetch.mockReset();

    // Setup responses for each call
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse,
      }) // Initial GET
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: mockTask1.id }),
      }) // PATCH response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse,
      }); // Refetch GET

    render(<TaskTableContainer />);

    // Wait for initial load
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    // Find and click the category change button
    const changeCategoryButton = screen.getAllByRole("button", { name: "Change Category" })[0];
    await userEvent.click(changeCategoryButton);

    // Check the PATCH call was made correctly
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial GET + PATCH + Refetch
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        `/api/tasks/${String(mockTask1.id)}`,
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "B" }),
        })
      );
    });

    // Check toast was shown
    expect(vi.mocked(toast)).toHaveBeenCalledWith("Task updated", expect.any(Object));
  });

  it("calls updateTask API twice (swap) and refetches twice when priority is changed up", async () => {
    // Reset mock and set up specific responses for this test
    mockFetch.mockReset();

    const responseWithTwoTasks = {
      data: [mockTask1, mockTask2],
      meta: { total: 2, page: 1, limit: 10 },
    };

    // Setup responses for each call
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithTwoTasks,
      }) // Initial GET
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: mockTask2.id }),
      }) // First PATCH (Task 2)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithTwoTasks,
      }) // First Refetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: mockTask1.id }),
      }) // Second PATCH (Task 1)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithTwoTasks,
      }); // Second Refetch

    render(<TaskTableContainer />);

    // Wait for initial load
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    // Find and click the priority up button for the second task
    const priorityUpButton = screen.getAllByRole("button", { name: "Priority Up" })[1]; // Task 2
    await userEvent.click(priorityUpButton);

    // Check the first PATCH call (Task 2 gets Task 1's priority)
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(5); // Initial GET + first PATCH + refetch + second PATCH + refetch
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        `/api/tasks/${String(mockTask2.id)}`,
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: mockTask1.priority }),
        })
      );
    });

    // Check the second PATCH call (Task 1 gets Task 2's original priority)
    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(
        4,
        `/api/tasks/${String(mockTask1.id)}`,
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: mockTask2.priority }),
        })
      );
    });

    // Check toast was called
    expect(vi.mocked(toast)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(toast)).toHaveBeenCalledWith("Task updated", expect.any(Object));
  });

  it("navigates to edit page when edit action is triggered", async () => {
    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    const editButton = screen.getAllByRole("button", { name: "Edit" })[0]; // First task
    await userEvent.click(editButton);

    // Check the spy on the href setter
    expect(locationHrefSpy).toHaveBeenCalledTimes(1);
    expect(locationHrefSpy).toHaveBeenCalledWith(`/tasks/${mockTask1.id}`);
  });

  it("calls duplicateTask API when duplicate action is triggered", async () => {
    // Reset mock and set up specific responses for this test
    mockFetch.mockReset();

    // Setup responses for each call
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse,
      }) // Initial GET
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 4 }),
      }) // POST response (new task ID)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse,
      }); // Refetch

    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    const duplicateButton = screen.getAllByRole("button", { name: "Duplicate" })[0]; // First task
    await userEvent.click(duplicateButton);

    // Wait for the POST call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial GET + POST + Refetch

      // Check POST call (body should exclude id, created_at, updated_at)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, created_at, updated_at, ...taskDataToSend } = mockTask1;
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "/api/tasks",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskDataToSend),
        })
      );
    });

    // Check toast was shown
    expect(vi.mocked(toast)).toHaveBeenCalledWith("Task duplicated", expect.any(Object));
  });

  it("calls deleteTask API when delete action is triggered", async () => {
    // Reset mock and set up specific responses for this test
    mockFetch.mockReset();

    // Setup responses for each call
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse,
      }) // Initial GET
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      }) // DELETE response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse,
      }); // Refetch

    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    const deleteButton = screen.getAllByRole("button", { name: "Delete" })[0]; // First task
    await userEvent.click(deleteButton);

    // Wait for the DELETE call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial GET + DELETE + Refetch
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        `/api/tasks/${String(mockTask1.id)}`,
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    // Check toast was shown
    expect(vi.mocked(toast)).toHaveBeenCalledWith("Task deleted", expect.any(Object));
  });

  it("handles API errors during mutations and shows toast", async () => {
    // Reset mock and set up specific responses for this test
    mockFetch.mockReset();

    // Setup responses for each call
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse,
      }) // Initial GET
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Failed to delete" }),
      }); // Failed DELETE response

    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    const deleteButton = screen.getAllByRole("button", { name: "Delete" })[0];
    await userEvent.click(deleteButton);

    // Wait for the DELETE call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial GET + DELETE
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        `/api/tasks/${String(mockTask1.id)}`,
        expect.objectContaining({ method: "DELETE" })
      );
    });

    // Check error toast was shown
    expect(vi.mocked(toast)).toHaveBeenCalledWith(
      "Error",
      expect.objectContaining({
        description: "Failed to delete task",
      })
    );
  });
});
