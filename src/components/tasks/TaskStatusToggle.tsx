import { Checkbox } from "../ui/checkbox";

import { cn } from "@/lib/utils";

interface TaskStatusToggleProps {
  taskId: number;
  isCompleted: boolean;
  className?: string;
  onStatusChange: (taskId: number, isCompleted: boolean) => void;
  disabled?: boolean;
}

export function TaskStatusToggle({ taskId, isCompleted, className, onStatusChange, disabled }: TaskStatusToggleProps) {
  return (
    <Checkbox
      checked={isCompleted}
      className={cn("translate-y-[2px]", className)}
      onCheckedChange={(checked: boolean | "indeterminate") => onStatusChange(taskId, !!checked)}
      aria-label="Toggle task status"
      disabled={disabled}
    />
  );
}
