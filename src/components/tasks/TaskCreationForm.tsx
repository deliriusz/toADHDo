import { useState, type ChangeEvent, useId } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { TaskCategory } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReloadIcon, FileTextIcon } from "@radix-ui/react-icons";
import { TaskCategoryToggle } from "./TaskCategoryToggle";

const MIN_NOTE_LENGTH = 3;
const MAX_NOTE_LENGTH = 200;

export default function TaskCreationForm() {
  const noteId = useId();
  const categoryId = useId();
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<TaskCategory>("B");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateNote = (value: string): string | null => {
    if (!value.trim()) {
      return "Note is required";
    }
    if (value.trim().length < MIN_NOTE_LENGTH) {
      return `Note must be at least ${MIN_NOTE_LENGTH} characters long`;
    }
    if (value.length > MAX_NOTE_LENGTH) {
      return `Note cannot be longer than ${MAX_NOTE_LENGTH} characters`;
    }
    return null;
  };

  const handleNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNote(newValue);
    setError(validateNote(newValue));
  };

  const handleCategoryChange = (_: number, newCategory: TaskCategory) => {
    setCategory(newCategory);
  };

  const handleGenerateDescription = async () => {
    const validationError = validateNote(note);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note, category }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate description");
      }

      const data = await response.json();

      const event = new CustomEvent("descriptionGenerated", {
        detail: {
          description: data.generatedDescription,
          category,
          note,
        },
        bubbles: true,
      });
      document.querySelector("[data-task-form]")?.dispatchEvent(event);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate description. Please try again.";
      toast.error(errorMessage);
      console.error("Error generating description:", error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-md border shadow-sm">
      <CardHeader className="bg-muted/50 pb-4">
        <CardTitle className="flex items-center text-lg">
          <FileTextIcon className="mr-2 h-5 w-5" />
          Create New Task
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor={noteId} className="text-sm font-medium flex justify-between">
              <span>Quick Note</span>
              <span
                className={`text-xs ${note.length > MAX_NOTE_LENGTH ? "text-destructive" : "text-muted-foreground"}`}
              >
                {note.length}/{MAX_NOTE_LENGTH}
              </span>
            </label>
            <Textarea
              id={noteId}
              placeholder="Enter a quick note about your task..."
              value={note}
              onChange={handleNoteChange}
              className={`min-h-[100px] resize-none transition-colors ${error ? "border-destructive" : ""}`}
              disabled={isLoading}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "note-error" : undefined}
            />
            {error && (
              <p id="note-error" className="text-sm text-destructive mt-1">
                {error}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor={categoryId} className="text-sm font-medium">
                Priority Category
              </label>
              <div id={categoryId} className="flex-shrink-0">
                <TaskCategoryToggle
                  taskId={-1} // Placeholder ID, not used for new tasks
                  currentCategory={category}
                  onCategoryChange={handleCategoryChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleGenerateDescription}
              disabled={isLoading || !!error}
              className="min-w-[170px] transition-all"
              size="default"
            >
              {isLoading ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>Generate Description</>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
