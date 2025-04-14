import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { TaskTableFiltersViewModel } from "./TaskTableContainer";
import { useDebouncedCallback } from "use-debounce";
import type { ChangeEvent } from "react";

interface TaskTableToolbarProps {
  filters: TaskTableFiltersViewModel;
  onFilterChange: (filters: Partial<TaskTableFiltersViewModel>) => void;
  selectedRowCount: number;
}

export function TaskTableToolbar({ filters, onFilterChange, selectedRowCount }: TaskTableToolbarProps) {
  // Debounce text filter to avoid too many API calls
  const debouncedDescriptionChange = useDebouncedCallback(
    (value: string) => onFilterChange({ description: value }),
    300
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          className="h-8 w-full sm:w-[150px] lg:w-[250px]"
          defaultValue={filters.description}
          onChange={(e: ChangeEvent<HTMLInputElement>) => debouncedDescriptionChange(e.target.value)}
        />

        <Select
          value={filters.status}
          onValueChange={(value: string) => onFilterChange({ status: value as TaskTableFiltersViewModel["status"] })}
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="incompleted">Incompleted</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value: string) =>
            onFilterChange({ category: value as TaskTableFiltersViewModel["category"] })
          }
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="A">Category A</SelectItem>
            <SelectItem value="B">Category B</SelectItem>
            <SelectItem value="C">Category C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedRowCount > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {selectedRowCount} {selectedRowCount === 1 ? "row" : "rows"} selected
          </span>
        </div>
      )}
    </div>
  );
}
