import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import type { TaskCategory } from "../../types";

interface TaskCategoryToggleProps {
  taskId: number;
  currentCategory: TaskCategory;
  onCategoryChange: (taskId: number, category: TaskCategory) => void;
  disabled?: boolean;
  "data-testid"?: string;
}

export function TaskCategoryToggle({
  taskId,
  currentCategory,
  onCategoryChange,
  disabled,
  "data-testid": dataTestId,
}: TaskCategoryToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={currentCategory}
      onValueChange={(value: string | undefined) => {
        if (value && value !== currentCategory) {
          onCategoryChange(taskId, value as TaskCategory);
        }
      }}
      className="flex justify-start gap-0.5"
      disabled={disabled}
      data-testid={dataTestId || "task-category-toggle"}
    >
      <ToggleGroupItem
        value="A"
        size="sm"
        className="h-7 w-7 data-[state=on]:bg-green-500/20 data-[state=on]:text-green-700"
        data-testid="category-a-option"
      >
        A
      </ToggleGroupItem>
      <ToggleGroupItem
        value="B"
        size="sm"
        className="h-7 w-7 data-[state=on]:bg-yellow-500/20 data-[state=on]:text-yellow-700"
        data-testid="category-b-option"
      >
        B
      </ToggleGroupItem>
      <ToggleGroupItem
        value="C"
        size="sm"
        className="h-7 w-7 data-[state=on]:bg-red-500/20 data-[state=on]:text-red-700"
        data-testid="category-c-option"
      >
        C
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
