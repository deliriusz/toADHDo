import { Button } from "../ui/button";
import { ChevronUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";

interface TaskPriorityControlProps {
  isFirst: boolean;
  isLast: boolean;
  onPriorityChange: (direction: "up" | "down") => void;
  disabled?: boolean;
}

export function TaskPriorityControl({ isFirst, isLast, onPriorityChange, disabled }: TaskPriorityControlProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onPriorityChange("up")}
        disabled={isFirst || disabled}
      >
        <ChevronUpIcon className="h-4 w-4" />
        <span className="sr-only">Move up</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onPriorityChange("down")}
        disabled={isLast || disabled}
      >
        <ChevronDownIcon className="h-4 w-4" />
        <span className="sr-only">Move down</span>
      </Button>
    </div>
  );
}
