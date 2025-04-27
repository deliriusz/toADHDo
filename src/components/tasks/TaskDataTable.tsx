import type { Table } from "@tanstack/react-table";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TaskStatusToggle } from "./TaskStatusToggle";
import { TaskCategoryToggle } from "./TaskCategoryToggle";
import { TaskPriorityControl } from "./TaskPriorityControl";
import { TaskRowActions } from "./TaskRowActions";
import { TaskTablePagination } from "./TaskTablePagination";
import { Checkbox } from "../ui/checkbox";
import type { TaskDTO, TaskCategory } from "../../types";
import showdown from "showdown";

interface TaskDataTableProps {
  table: Table<TaskDTO>;
  onStatusChange: (taskId: number, isCompleted: boolean) => void;
  onCategoryChange: (taskId: number, category: TaskCategory) => void;
  onPriorityChange: (taskId: number, direction: "up" | "down") => void;
  onEdit: (taskId: number) => void;
  onDuplicate: (taskData: TaskDTO) => void;
  onDelete: (taskId: number) => void;
  isMutating: boolean;
}

export function TaskDataTable({
  table,
  onStatusChange,
  onCategoryChange,
  onPriorityChange,
  onEdit,
  onDuplicate,
  onDelete,
  isMutating,
}: TaskDataTableProps) {
  const converter = new showdown.Converter();

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <UITable>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={(value: boolean | "indeterminate") => table.toggleAllPageRowsSelected(!!value)}
                  aria-label="Select all"
                  className="translate-y-[2px]"
                  disabled={isMutating}
                />
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-24">Category</TableHead>
              <TableHead className="w-24">Priority</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                <TableCell className="w-12">
                  <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value: boolean | "indeterminate") => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                    disabled={isMutating}
                  />
                </TableCell>
                {/* TODO: security risk, sanitize input */}
                <TableCell dangerouslySetInnerHTML={{ __html: converter.makeHtml(row.original.description) }} />
                <TableCell>
                  <TaskStatusToggle
                    taskId={row.original.id}
                    isCompleted={!!row.original.completed_at}
                    onStatusChange={onStatusChange}
                    disabled={isMutating}
                  />
                </TableCell>
                <TableCell>
                  <TaskCategoryToggle
                    taskId={row.original.id}
                    currentCategory={row.original.category}
                    onCategoryChange={onCategoryChange}
                    disabled={isMutating}
                  />
                </TableCell>
                <TableCell>
                  <TaskPriorityControl
                    isFirst={row.index === 0}
                    isLast={row.index === table.getRowModel().rows.length - 1}
                    onPriorityChange={(direction) => onPriorityChange(row.original.id, direction)}
                    disabled={isMutating}
                  />
                </TableCell>
                <TableCell>
                  <TaskRowActions
                    taskId={row.original.id}
                    taskData={row.original}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    disabled={isMutating}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </UITable>
      </div>
      <TaskTablePagination table={table} />
    </div>
  );
}
