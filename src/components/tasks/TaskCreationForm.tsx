import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { TaskCategory } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ReloadIcon } from "@radix-ui/react-icons";

const MIN_NOTE_LENGTH = 3;
const MAX_NOTE_LENGTH = 200;

export default function TaskCreationForm() {
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
    <Card>
      <CardHeader>
        <CardTitle>Task Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Quick Note
              <span className="text-muted-foreground ml-1 text-xs">
                ({note.length}/{MAX_NOTE_LENGTH})
              </span>
            </label>
            <Textarea
              id="note"
              placeholder="Enter a quick note about your task..."
              value={note}
              onChange={handleNoteChange}
              className={`min-h-[100px] ${error ? "border-destructive" : ""}`}
              disabled={isLoading}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "note-error" : undefined}
            />
            {error && (
              <p id="note-error" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="category-group" className="text-sm font-medium">
              Priority Category
            </label>
            <ToggleGroup
              id="category-group"
              type="single"
              value={category}
              onValueChange={(value: TaskCategory) => setCategory(value)}
              aria-label="Task Priority"
              disabled={isLoading}
            >
              <ToggleGroupItem value="A" aria-label="High Priority">
                A
              </ToggleGroupItem>
              <ToggleGroupItem value="B" aria-label="Medium Priority">
                B
              </ToggleGroupItem>
              <ToggleGroupItem value="C" aria-label="Low Priority">
                C
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleGenerateDescription} disabled={isLoading || !!error} className="min-w-[140px]">
              {isLoading ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Description"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
