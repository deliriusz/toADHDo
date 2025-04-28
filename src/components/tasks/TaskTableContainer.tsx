import { type TaskDTO, type PaginatedResponse, type TaskCategory, type UpdateTaskCommand } from "../../types";
import { useState, useEffect } from "react";
import { useReactTable, type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { TaskTableToolbar } from "@/components/tasks/TaskTableToolbar";
import { TaskDataTable } from "@/components/tasks/TaskDataTable";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { ModalProvider } from "@/components/contexts/ModalContext";
import { MultiStepTaskCreationModal } from "./MultiStepTaskCreationModal";

// View Models for component state
export interface TaskTableFiltersViewModel {
  description: string;
  status: "all" | "completed" | "incompleted";
  category: "A" | "B" | "C" | "all";
}

const defaultFilters: TaskTableFiltersViewModel = {
  description: "",
  status: "incompleted",
  category: "all",
};

// Helper to convert UI status to API boolean
const statusToBoolean = (status: TaskTableFiltersViewModel["status"]): boolean | undefined => {
  if (status === "all") return undefined;
  return status === "completed";
};

export function TaskTableContainer() {
  // Local state for filters
  const [filters, setFilters] = useState<TaskTableFiltersViewModel>(defaultFilters);

  // Table state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Always sort by priority
  const [sorting] = useState([{ id: "priority", desc: false }]);

  // Row selection state
  const [rowSelection, setRowSelection] = useState({});

  // Data fetching state
  const [data, setData] = useState<PaginatedResponse<TaskDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // Fetch tasks data
  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        order: sorting[0]?.desc ? "desc" : "asc",
      });

      if (filters.category !== "all") {
        searchParams.append("filter[category]", filters.category);
      }

      const completed = statusToBoolean(filters.status);
      if (completed !== undefined) {
        searchParams.append("filter[completed]", String(completed));
      }

      if (filters.description) {
        searchParams.append("filter[description]", filters.description);
      }

      const response = await fetch(`/api/tasks?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch tasks"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters, pagination.pageIndex, pagination.pageSize, sorting]);

  // Mutation handlers
  const updateTask = async (taskId: number, updates: UpdateTaskCommand) => {
    setIsMutating(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      await fetchTasks();
      toast("Task updated", {
        description: "The task has been updated successfully.",
      });
    } catch (err) {
      toast("Error", {
        description: err instanceof Error ? err.message : "Failed to update task",
      });
    } finally {
      setIsMutating(false);
    }
  };

  const duplicateTask = async (taskData: TaskDTO) => {
    setIsMutating(true);
    try {
      // Destructure to exclude id *before* creating the object to send
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, created_at, updated_at, ...createData } = taskData;

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send only the necessary fields for creation
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate task");
      }

      await fetchTasks();
      toast("Task duplicated", {
        description: "The task has been duplicated successfully.",
      });
    } catch (err) {
      toast("Error", {
        description: err instanceof Error ? err.message : "Failed to duplicate task",
      });
    } finally {
      setIsMutating(false);
    }
  };

  const deleteTask = async (taskId: number) => {
    setIsMutating(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      await fetchTasks();
      toast("Task deleted", {
        description: "The task has been deleted successfully.",
      });
    } catch (err) {
      toast("Error", {
        description: err instanceof Error ? err.message : "Failed to delete task",
      });
    } finally {
      setIsMutating(false);
    }
  };

  // Define table columns
  const columns = useState<ColumnDef<TaskDTO>[]>(() => [
    // Columns will be defined in the next step
  ])[0];

  // Initialize table
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    pageCount: data ? Math.ceil(data.meta.total / pagination.pageSize) : -1,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<TaskTableFiltersViewModel>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Task action handlers
  const handleStatusChange = (taskId: number, isCompleted: boolean) => {
    updateTask(taskId, {
      completed_at: isCompleted ? new Date().toISOString() : null,
    });
  };

  const handleCategoryChange = (taskId: number, category: TaskCategory) => {
    updateTask(taskId, { category });
  };

  const handlePriorityChange = async (taskId: number, direction: "up" | "down") => {
    const currentIndex = data?.data.findIndex((task) => task.id === taskId) ?? -1;
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetTask = data?.data[targetIndex];
    if (!targetTask || !data?.data) return;

    // Swap priorities
    await updateTask(taskId, { priority: targetTask.priority });
    await updateTask(targetTask.id, { priority: data.data[currentIndex].priority });
  };

  const handleEdit = (taskId: number) => {
    window.location.href = `/tasks/${taskId}`;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message || "Failed to load tasks. Please try again."}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 relative w-4/5 mx-auto backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 rounded-2xl shadow-2xl p-8 text-white border border-white/10">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-transparent bg-clip-text drop-shadow-lg">
          Tasks
        </h1>
        <LogoutButton variant="outline" size="sm" className="text-blue-100 border-white/20 hover:bg-white/10" />
      </div>

      <ModalProvider>
        <TaskTableToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          selectedRowCount={Object.keys(rowSelection).length}
        />
        <MultiStepTaskCreationModal />
      </ModalProvider>
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <TaskDataTable
          table={table}
          onStatusChange={handleStatusChange}
          onCategoryChange={handleCategoryChange}
          onPriorityChange={handlePriorityChange}
          onEdit={handleEdit}
          onDuplicate={duplicateTask}
          onDelete={deleteTask}
          isMutating={isMutating}
        />
      </div>
      <Toaster />
    </div>
  );
}
