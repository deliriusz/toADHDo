import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { TaskTableFiltersViewModel } from "./TaskTableContainer";
import { useDebouncedCallback } from "use-debounce";
import type { ChangeEvent } from "react";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { MixerHorizontalIcon, CheckIcon, CircleIcon } from "@radix-ui/react-icons";

// Import the context object directly
import { useModalContext } from "../contexts/ModalContext";

interface TaskTableToolbarProps {
  filters: TaskTableFiltersViewModel;
  onFilterChange: (filters: Partial<TaskTableFiltersViewModel>) => void;
  selectedRowCount: number;
}

export function TaskTableToolbar({ filters, onFilterChange, selectedRowCount }: TaskTableToolbarProps) {
  const { openModal } = useModalContext();
  // Debounce text filter to avoid too many API calls
  const debouncedDescriptionChange = useDebouncedCallback(
    (value: string) => onFilterChange({ description: value }),
    300
  );

  const handleAddTaskClick = () => {
    openModal("", "", "B");
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filter tasks..."
          className="h-8 w-full sm:w-[150px] lg:w-[300px] xl:w-[500px]"
          defaultValue={filters.description}
          onChange={(e: ChangeEvent<HTMLInputElement>) => debouncedDescriptionChange(e.target.value)}
        />

        <Select
          value={filters.status}
          onValueChange={(value: string) => onFilterChange({ status: value as TaskTableFiltersViewModel["status"] })}
        >
          <SelectTrigger className="h-8 w-[130px] md:w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center">
                <MixerHorizontalIcon className="mr-2 h-4 w-4" />
                All
              </div>
            </SelectItem>
            <SelectItem value="completed">
              <div className="flex items-center">
                <CheckIcon className="mr-2 h-4 w-4" />
                Completed
              </div>
            </SelectItem>
            <SelectItem value="incompleted">
              <div className="flex items-center">
                <CircleIcon className="mr-2 h-4 w-4" />
                Incompleted
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value: string) =>
            onFilterChange({ category: value as TaskTableFiltersViewModel["category"] })
          }
        >
          <SelectTrigger className="h-8 w-[110px] md:w-[120px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="A">Category A</SelectItem>
            <SelectItem value="B">Category B</SelectItem>
            <SelectItem value="C">Category C</SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="default"
          className="text-black-500 border-white/30 bg-white/14 hover:bg-white/30"
          onClick={handleAddTaskClick}
          data-testid="add-task-button"
        >
          <PlusIcon className="size-4 mr-1" />
          Add Task
        </Button>
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
