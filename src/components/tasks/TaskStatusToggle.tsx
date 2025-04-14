import { Checkbox } from "../ui/checkbox";

interface TaskStatusToggleProps {
  taskId: number;
  isCompleted: boolean;
  onStatusChange: (taskId: number, isCompleted: boolean) => void;
  disabled?: boolean;
}

export function TaskStatusToggle({ taskId, isCompleted, onStatusChange, disabled }: TaskStatusToggleProps) {
  return (
    <Checkbox
      checked={isCompleted}
      onCheckedChange={(checked: boolean | "indeterminate") => onStatusChange(taskId, !!checked)}
      aria-label="Toggle task status"
      className="translate-y-[2px]"
      disabled={disabled}
    />
  );
}
