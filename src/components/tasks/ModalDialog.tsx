import { useState, type ChangeEvent, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { CreateTaskCommand } from "@/types";
import { ReloadIcon } from "@radix-ui/react-icons";

const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_DESCRIPTION_LENGTH = 10;

export default function ModalDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [originalDescription, setOriginalDescription] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [category, setCategory] = useState<CreateTaskCommand["category"]>("B");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const element = document.querySelector("[data-modal-dialog]");
    if (!element) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          const target = mutation.target as HTMLElement;
          let origDesc, genDesc;

          switch (mutation.attributeName) {
            case "data-is-open":
              setIsOpen(target.getAttribute("data-is-open") === "true");
              break;
            case "data-original-description":
              origDesc = target.getAttribute("data-original-description") || "";
              setOriginalDescription(origDesc);
              break;
            case "data-generated-description":
              genDesc = target.getAttribute("data-generated-description") || "";
              setGeneratedDescription(genDesc);
              setEditedDescription(genDesc);
              setError(null);
              break;
            case "data-category":
              setCategory((target.getAttribute("data-category") || "B") as CreateTaskCommand["category"]);
              break;
          }
        }
      });
    });

    observer.observe(element, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const validateDescription = (value: string): string | null => {
    if (!value.trim()) {
      return "Description cannot be empty";
    }
    if (value.trim().length < MIN_DESCRIPTION_LENGTH) {
      return `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters long`;
    }
    if (value.length > MAX_DESCRIPTION_LENGTH) {
      return `Description cannot be longer than ${MAX_DESCRIPTION_LENGTH} characters`;
    }
    return null;
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditedDescription(newValue);
    setError(validateDescription(newValue));
  };

  const handleClose = () => {
    const event = new CustomEvent("closeModal", { bubbles: true });
    document.querySelector("[data-modal-dialog]")?.dispatchEvent(event);
    setError(null);
  };

  const handleAccept = async () => {
    const validationError = validateDescription(editedDescription);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: editedDescription,
          category,
          task_source: editedDescription === generatedDescription ? "full-ai" : "edited-ai",
        } as CreateTaskCommand),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create task");
      }

      toast.success("Task created successfully");
      handleClose();
      window.location.href = "/tasks";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create task. Please try again.";
      toast.error(errorMessage);
      console.error("Error creating task:", error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Generated Description</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="original-note" className="text-sm font-medium">
              Original Note
            </label>
            <Textarea
              id="original-note"
              value={originalDescription}
              readOnly
              className="min-h-[100px] bg-muted"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="generated-description" className="text-sm font-medium">
              Generated Description
              <span className="text-muted-foreground ml-1 text-xs">
                ({editedDescription.length}/{MAX_DESCRIPTION_LENGTH})
              </span>
            </label>
            <Textarea
              id="generated-description"
              value={editedDescription}
              onChange={handleDescriptionChange}
              className={`min-h-[200px] ${error ? "border-destructive" : ""}`}
              placeholder="Edit the generated description if needed..."
              disabled={isLoading}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "description-error" : undefined}
            />
            {error && (
              <p id="description-error" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={isLoading || !!error} className="min-w-[160px]">
            {isLoading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Creating Task...
              </>
            ) : (
              "Accept & Create Task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
