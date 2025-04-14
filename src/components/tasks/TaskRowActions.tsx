import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { DotsHorizontalIcon, Pencil1Icon, CopyIcon, TrashIcon } from "@radix-ui/react-icons";
import type { TaskDTO } from "../../types";

interface TaskRowActionsProps {
  taskId: number;
  taskData: TaskDTO;
  onEdit: (taskId: number) => void;
  onDuplicate: (taskData: TaskDTO) => void;
  onDelete: (taskId: number) => void;
  disabled?: boolean;
}

export function TaskRowActions({ taskId, taskData, onEdit, onDuplicate, onDelete, disabled }: TaskRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={disabled}>
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(taskId)} disabled={disabled}>
          <Pencil1Icon className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate(taskData)} disabled={disabled}>
          <CopyIcon className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            if (confirm("Are you sure you want to delete this task?")) {
              onDelete(taskId);
            }
          }}
          disabled={disabled}
          className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-950 dark:focus:text-red-400"
        >
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
