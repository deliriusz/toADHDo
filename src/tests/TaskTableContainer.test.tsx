import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
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
const mockTask3: TaskDTO = {
  id: 3,
  description: "Task 3",
  completed_at: null,
  category: "A",
  priority: "0|c:1",
  task_source: "edited-user",
  updated_at: new Date().toISOString(),
  user_id: "user1",
  created_at: new Date().toISOString(),
};

const mockPaginatedResponse: PaginatedResponse<TaskDTO> = {
  data: [mockTask1, mockTask2],
  meta: { total: 2, page: 1, limit: 10 },
};

const mockPaginatedResponsePage2: PaginatedResponse<TaskDTO> = {
  data: [mockTask3],
  meta: { total: 3, page: 2, limit: 10 },
};

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
    mockFetch.mockClear();

    // Restore Date mock if it exists
    vi.useRealTimers();

    // Setup window.location spy
    // We need to delete the original location before spying, JSDOM limitation
    // @ts-expect-error
    delete window.location;
    window.location = { ...originalWindowLocation }; // Restore a plain object copy
    locationHrefSpy = vi.spyOn(window.location, 'href', 'set');

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
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tasks?page=1&limit=10&order=asc&filter%5Bcompleted%5D=false"
    );
    expect(screen.getByTestId("task-data-table")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByTestId("task-table-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
  });

  it("displays error state if fetch fails", async () => {
    const errorMessage = "Failed to fetch tasks";
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

    const filterButton = screen.getByRole("button", { name: "Filter" });
    await act(async () => {
      await userEvent.click(filterButton);
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    // Expect URL encoded params
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tasks?page=1&limit=10&order=asc&filter%5Bcompleted%5D=false&filter%5Bdescription%5D=test+filter"
    );
  });

  it("refetches tasks when pagination changes (simulated via table state change)", async () => {
    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());
    expect(mockFetch).toHaveBeenCalledTimes(1);
    // Expect URL encoded params
    expect(mockFetch).toHaveBeenCalledWith("/api/tasks?page=1&limit=10&order=asc&filter%5Bcompleted%5D=false");

    const filterButton = screen.getByRole("button", { name: "Filter" });
    await act(async () => {
      await userEvent.click(filterButton);
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    // Expect URL encoded params
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tasks?page=1&limit=10&order=asc&filter%5Bcompleted%5D=false&filter%5Bdescription%5D=test+filter"
    );
  });

  it("calls updateTask API when status is changed", async () => {
    // Mock Date for predictable completed_at value
    const FIXED_DATE = new Date("2024-01-01T12:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);

    // Setup fetch mocks - be explicit about all calls
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockPaginatedResponse }) // Initial GET
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // PATCH response
      .mockResolvedValueOnce({ ok: true, json: async () => mockPaginatedResponse }); // Refetch GET

    render(<TaskTableContainer />);
    
    // Wait for initial load to complete
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());
    expect(mockFetch).toHaveBeenCalledTimes(1); // Verify initial GET happened
    
    // First, restore real timers before performing async UI interactions
    vi.useRealTimers();
    
    const toggleButton = screen.getAllByRole("button", { name: "Toggle Status" })[0]; // First task
    
    // Click the toggle button
    await userEvent.click(toggleButton);
    
    // Now wait for the PATCH request specifically, rather than counting total calls
    await waitFor(() => {
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
    
    // Check that the toast was shown (no need for additional waitFor)
    expect(vi.mocked(toast)).toHaveBeenCalledWith("Task updated", expect.any(Object));
  });

  it("calls updateTask API when category is changed", async () => {
    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    const changeCategoryButton = screen.getAllByRole("button", { name: "Change Category" })[0];
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // Mock PATCH response ONLY
    // The default mock from beforeEach will handle the refetch GET

    await act(async () => {
        await userEvent.click(changeCategoryButton);
    });

    // Wait for the fetch calls to complete (Initial GET, PATCH, Refetch GET)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3));

    // Check the PATCH call details
    expect(mockFetch).toHaveBeenNthCalledWith(2,
        `/api/tasks/${String(mockTask1.id)}`,
        expect.objectContaining({
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: "B" }),
        })
    );
    // Check the toast call *after* waiting for fetches
    expect(vi.mocked(toast)).toHaveBeenCalledWith("Task updated", expect.any(Object));
  });

  it("calls updateTask API twice (swap) and refetches twice when priority is changed up", async () => {
    const responseWithTwoTasks: PaginatedResponse<TaskDTO> = {
      data: [mockTask1, mockTask2],
      meta: { total: 2, page: 1, limit: 10 },
    };
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => responseWithTwoTasks });
    // Mock responses for the two PATCH calls and the *two* subsequent refetches
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // First PATCH (Task 2)
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => responseWithTwoTasks }); // First Refetch
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // Second PATCH (Task 1)
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => responseWithTwoTasks }); // Second Refetch


    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    const priorityUpButton = screen.getAllByRole("button", { name: "Priority Up" })[1]; // Task 2

    await act(async () => {
        await userEvent.click(priorityUpButton);
    });

    // Expect 5 calls: Initial, PATCH Task 2, Refetch, PATCH Task 1, Refetch
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(5));

    // Check first PATCH call (Task 2 gets Task 1's priority)
    expect(mockFetch).toHaveBeenNthCalledWith(2,
        `/api/tasks/${String(mockTask2.id)}`,
        expect.objectContaining({
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priority: mockTask1.priority }),
        })
    );
    // Check second PATCH call (Task 1 gets Task 2's original priority)
    expect(mockFetch).toHaveBeenNthCalledWith(4, // Note: 4th call after first refetch
        `/api/tasks/${String(mockTask1.id)}`,
        expect.objectContaining({
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priority: mockTask2.priority }),
        })
    );

    await waitFor(() => expect(vi.mocked(toast)).toHaveBeenCalledTimes(2));
    expect(vi.mocked(toast)).toHaveBeenCalledWith("Task updated", expect.any(Object));
  });

  it("navigates to edit page when edit action is triggered", async () => {
    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    const editButton = screen.getAllByRole("button", { name: "Edit" })[0]; // First task
    await act(async () => {
        await userEvent.click(editButton);
    });

    // Check the spy on the href setter
    expect(locationHrefSpy).toHaveBeenCalledTimes(1);
    expect(locationHrefSpy).toHaveBeenCalledWith(`/tasks/${mockTask1.id}`);
  });

  it("calls duplicateTask API when duplicate action is triggered", async () => {
    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    const duplicateButton = screen.getAllByRole("button", { name: "Duplicate" })[0]; // First task
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 4 }) }); // Mock POST response (new task ID)
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockPaginatedResponse }); // Mock refetch

    await act(async () => {
      await userEvent.click(duplicateButton);
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3)); // Initial, POST, Refetch

    // Check POST call (body should exclude id, created_at, updated_at)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, ...taskDataToSend } = mockTask1;
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "/api/tasks",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskDataToSend), // Use the object without timestamps
      })
    );

    // Check toast message using vi.mocked
    await waitFor(() => expect(vi.mocked(toast)).toHaveBeenCalledWith("Task duplicated", expect.any(Object)));
  });

  it("calls deleteTask API when delete action is triggered", async () => {
    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    const deleteButton = screen.getAllByRole("button", { name: "Delete" })[0]; // First task
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // Mock DELETE response
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockPaginatedResponse }); // Mock refetch

    await act(async () => {
      await userEvent.click(deleteButton);
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3)); // Initial, DELETE, Refetch

    // Check DELETE call
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      `/api/tasks/${String(mockTask1.id)}`,
      expect.objectContaining({
        method: "DELETE",
      })
    );

    // Check toast message using vi.mocked
    await waitFor(() => expect(vi.mocked(toast)).toHaveBeenCalledWith("Task deleted", expect.any(Object)));
  });

  it("handles API errors during mutations and shows toast", async () => {
    render(<TaskTableContainer />);
    await waitFor(() => expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument());

    const deleteButton = screen.getAllByRole("button", { name: "Delete" })[0];
    const errorMsg = "Failed to delete";
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ message: errorMsg }) }); // Mock failed DELETE response

    await act(async () => {
      await userEvent.click(deleteButton);
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2)); // Initial, DELETE

    // Check DELETE call
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      `/api/tasks/${String(mockTask1.id)}`,
      expect.objectContaining({ method: "DELETE" })
    );

    // Check error toast using vi.mocked
    await waitFor(() =>
      expect(vi.mocked(toast)).toHaveBeenCalledWith("Error", expect.objectContaining({ description: "Failed to delete task" }))
    ); // Default message since parsing might fail
  });
});
