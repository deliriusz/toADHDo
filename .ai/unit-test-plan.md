# Unit Test Plan for Task Table Feature

## Component Structure (ASCII Representation)

```ascii
TaskTableContainer
│
├── h1 (Tasks title)
│
├── LogoutButton        # src/components/ui/LogoutButton.tsx
│   ├── Button          # src/components/ui/button.tsx (Shadcn/ui)
│   └── LoadingSpinner  # src/components/ui/loading-spinner.tsx (Conditional)
│
├── TaskTableToolbar    # src/components/tasks/TaskTableToolbar.tsx
│   ├── Input           # src/components/ui/input.tsx (Shadcn/ui)
│   ├── Select          # src/components/ui/select.tsx (Shadcn/ui) - Status
│   │   ├── SelectTrigger
│   │   ├── SelectValue
│   │   └── SelectContent
│   │       ├── SelectItem (All)
│   │       │   └── MixerHorizontalIcon (@radix-ui/react-icons)
│   │       ├── SelectItem (Completed)
│   │       │   └── CheckIcon (@radix-ui/react-icons)
│   │       └── SelectItem (Incompleted)
│   │           └── CircleIcon (@radix-ui/react-icons)
│   ├── Select          # src/components/ui/select.tsx (Shadcn/ui) - Category
│   │   ├── SelectTrigger
│   │   ├── SelectValue
│   │   └── SelectContent
│   │       ├── SelectItem (All)
│   │       ├── SelectItem (Category A)
│   │       ├── SelectItem (Category B)
│   │       └── SelectItem (Category C)
│   ├── Button          # src/components/ui/button.tsx (Shadcn/ui) - Add Task
│   │   └── PlusIcon      # lucide-react
│   └── span (Selected row count - Conditional)
│
├── TaskDataTable       # src/components/tasks/TaskDataTable.tsx
│   ├── UITable         # src/components/ui/table.tsx (Shadcn/ui)
│   │   ├── TableHeader
│   │   │   └── TableRow
│   │   │       ├── TableHead (Checkbox)
│   │   │       │   └── Checkbox # src/components/ui/checkbox.tsx (Shadcn/ui)
│   │   │       ├── TableHead (Description)
│   │   │       ├── TableHead (Status)
│   │   │       ├── TableHead (Category)
│   │   │       ├── TableHead (Priority)
│   │   │       └── TableHead (Actions)
│   │   └── TableBody
│   │       └── TableRow (Repeated for each task)
│   │           ├── TableCell (Checkbox)
│   │           │   └── Checkbox # src/components/ui/checkbox.tsx (Shadcn/ui)
│   │           ├── TableCell (Description)
│   │           ├── TableCell (Status)
│   │           │   └── TaskStatusToggle # src/components/tasks/TaskStatusToggle.tsx
│   │           │       └── Checkbox # src/components/ui/checkbox.tsx (Shadcn/ui)
│   │           ├── TableCell (Category)
│   │           │   └── TaskCategoryToggle # src/components/tasks/TaskCategoryToggle.tsx
│   │           │       └── ToggleGroup # src/components/ui/toggle-group.tsx (Shadcn/ui)
│   │           │           ├── ToggleGroupItem (A)
│   │           │           ├── ToggleGroupItem (B)
│   │           │           └── ToggleGroupItem (C)
│   │           ├── TableCell (Priority)
│   │           │   └── TaskPriorityControl # src/components/tasks/TaskPriorityControl.tsx
│   │           │       ├── Button # src/components/ui/button.tsx (Shadcn/ui) - Up
│   │           │       │   └── ChevronUpIcon (@radix-ui/react-icons)
│   │           │       │   └── span (sr-only)
│   │           │       └── Button # src/components/ui/button.tsx (Shadcn/ui) - Down
│   │           │           └── ChevronDownIcon (@radix-ui/react-icons)
│   │           │           └── span (sr-only)
│   │           └── TableCell (Actions)
│   │               └── TaskRowActions # src/components/tasks/TaskRowActions.tsx
│   │                   └── DropdownMenu # src/components/ui/dropdown-menu.tsx (Shadcn/ui)
│   │                       ├── DropdownMenuTrigger
│   │                       │   └── Button # src/components/ui/button.tsx (Shadcn/ui)
│   │                       │       └── DotsHorizontalIcon (@radix-ui/react-icons)
│   │                       │       └── span (sr-only)
│   │                       └── DropdownMenuContent
│   │                           ├── DropdownMenuItem (Edit)
│   │                           │   └── Pencil1Icon (@radix-ui/react-icons)
│   │                           ├── DropdownMenuItem (Duplicate)
│   │                           │   └── CopyIcon (@radix-ui/react-icons)
│   │                           ├── DropdownMenuSeparator
│   │                           └── DropdownMenuItem (Delete)
│   │                               └── TrashIcon (@radix-ui/react-icons)
│   └── TaskTablePagination # src/components/tasks/TaskTablePagination.tsx
│       ├── p (Rows per page text)
│       ├── Select # src/components/ui/select.tsx (Shadcn/ui) - Page Size
│       │   ├── SelectTrigger
│       │   ├── SelectValue
│       │   └── SelectContent
│       │       └── SelectItem (Repeated for 10, 20, 30, 40, 50)
│       ├── div (Page X of Y text)
│       ├── Button # src/components/ui/button.tsx (Shadcn/ui) - First Page
│       │   └── ChevronLeftIcon (@radix-ui/react-icons) x2
│       │   └── span (sr-only)
│       ├── Button # src/components/ui/button.tsx (Shadcn/ui) - Previous Page
│       │   └── ChevronLeftIcon (@radix-ui/react-icons)
│       │   └── span (sr-only)
│       ├── Button # src/components/ui/button.tsx (Shadcn/ui) - Next Page
│       │   └── ChevronRightIcon (@radix-ui/react-icons)
│       │   └── span (sr-only)
│       └── Button # src/components/ui/button.tsx (Shadcn/ui) - Last Page
│           └── ChevronRightIcon (@radix-ui/react-icons) x2
│           └── span (sr-only)
│
├── Toaster             # src/components/ui/sonner.tsx (Likely Shadcn/ui Sonner wrapper)
│
├── LoadingSpinner      # src/components/ui/loading-spinner.tsx (Conditional)
│
└── Alert               # src/components/ui/alert.tsx (Shadcn/ui - Conditional)
    └── AlertDescription
```

## Unit Testing Recommendations

Based on the component structure, the following components are recommended for unit testing:

1.  **`TaskTableContainer`** (`src/components/tasks/TaskTableContainer.tsx`)
    *   **Why:** Manages state (filters, pagination, selection, loading/error), data fetching logic (`fetchTasks`), and mutation logic (`updateTask`, `duplicateTask`, `deleteTask`). Handles events (`handleFilterChange`, etc.).
    *   **What to test:**
        *   Initial state correctness (default filters, pagination).
        *   State changes in response to user actions (filter changes, page changes).
        *   Correct API call (`fetch`) parameters based on state.
        *   Conditional rendering based on `isLoading`, `error`, `data`.
        *   Correct prop drilling to child components (`TaskTableToolbar`, `TaskDataTable`).
    *   **How:** Mock `fetch`, `toast` library, and potentially child components.

2.  **`TaskTableToolbar`** (`src/components/tasks/TaskTableToolbar.tsx`)
    *   **Why:** Handles user interactions with filters (text input, selects), including debouncing. Handles navigation for creating new tasks.
    *   **What to test:**
        *   Correct rendering of form controls with values from `filters` prop.
        *   Calling `onFilterChange` with correct data after user interaction.
        *   Debouncing functionality for the text input.
        *   Calling `window.location.href` on "Add Task" button click.
    *   **How:** Mock `onFilterChange`, `useDebouncedCallback` (or its timing mechanism), and `window.location`.

3.  **`TaskPriorityControl`** (`src/components/tasks/TaskPriorityControl.tsx`)
    *   **Why:** Contains logic for conditionally disabling buttons based on `isFirst`/`isLast` props and calls a callback with the direction.
    *   **What to test:**
        *   Correct button rendering.
        *   `disabled` state of buttons based on `isFirst`, `isLast`, and `disabled` props.
        *   Calling `onPriorityChange` with correct argument (`'up'` or `'down'`) on button clicks.
    *   **How:** Mock `onPriorityChange`.

4.  **`TaskRowActions`** (`src/components/tasks/TaskRowActions.tsx`)
    *   **Why:** Manages the row's context menu, calls action handlers (Edit, Duplicate, Delete), and handles the `confirm` dialog for deletion.
    *   **What to test:**
        *   Correct rendering of the menu and its items.
        *   Calling appropriate functions (`onEdit`, `onDuplicate`, `onDelete`) on menu item clicks.
        *   Calling `window.confirm` before `onDelete` and ensuring `onDelete` is called only upon confirmation.
    *   **How:** Mock `onEdit`, `onDuplicate`, `onDelete`, and `window.confirm`.

5.  **`TaskTablePagination`** (`src/components/tasks/TaskTablePagination.tsx`)
    *   **Why:** Manages pagination interactions (page size change, page navigation) and communicates with the table instance. Includes logic for disabling navigation buttons.
    *   **What to test:**
        *   Correct rendering of controls (page size select, navigation buttons).
        *   `disabled` state of navigation buttons based on the (mocked) table state.
        *   Correct calls to `table` object methods (`setPageSize`, `setPageIndex`, `previousPage`, `nextPage`) upon user interaction.
    *   **How:** Mock the `table` object and its relevant methods (`getState`, `getPageCount`, `getCanPreviousPage`, `getCanNextPage`, etc.).

6.  **`LogoutButton`** (`src/components/ui/LogoutButton.tsx`)
    *   **Why:** Contains logic for calling the logout API, managing loading state, and redirecting on success.
    *   **What to test:**
        *   Button rendering.
        *   `loading` state changes during API call.
        *   Correct `fetch` call (URL, method).
        *   Redirection (`window.location.href`) on successful logout (mocked fetch success).
    *   **How:** Mock `fetch` and `window.location`.

### Lower Priority Components for Unit Tests:

*   **`TaskDataTable`**: Primarily renders table structure based on `table` data and passes props. Testing overlaps significantly with `TaskTableContainer` and individual cell components.
*   **`TaskStatusToggle`**, **`TaskCategoryToggle`**: Relatively simple; render a UI control and call a callback. Testing the callback invocation is the main value.
*   **UI Components (`src/components/ui`)**: Assumed to be wrappers around tested libraries (Shadcn/ui, Radix UI). Test only if significant custom logic is added.

**General Approach:** Focus unit tests on components with complex logic, state management, side effects (API calls, navigation), and user interactions. Isolate components using mocking for external dependencies. 