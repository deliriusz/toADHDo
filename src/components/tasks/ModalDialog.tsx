import { useState, type ChangeEvent, useEffect, useId } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { CreateTaskCommand } from "@/types";
import { ReloadIcon, FileTextIcon, CheckIcon } from "@radix-ui/react-icons";
import { TaskCategoryToggle } from "./TaskCategoryToggle";
import { useModalContext } from "../contexts/ModalContext";

const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_DESCRIPTION_LENGTH = 10;

export default function ModalDialog() {
  const originalNoteId = useId();
  const generatedDescriptionId = useId();
  const categoryId = useId();
  const {
    isOpen,
    closeModal,
    description: generatedDescription,
    note: originalDescription,
    category,
  } = useModalContext();
  const [editedDescription, setEditedDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update the edited description when the generated description changes
  useEffect(() => {
    if (generatedDescription) {
      setEditedDescription(generatedDescription);
      setError(null);
    }
  }, [generatedDescription]);

  // Legacy support for data attributes
  useEffect(() => {
    const element = document.querySelector("[data-modal-dialog]");
    if (!element) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          const target = mutation.target as HTMLElement;
          let genDesc = "";

          switch (mutation.attributeName) {
            case "data-is-open":
              if (target.getAttribute("data-is-open") === "true") {
                // We don't need to update isOpen as it's controlled by context now
                // but we keep this for backward compatibility
              }
              break;
            case "data-original-description":
              // No need to update, we use context
              break;
            case "data-generated-description":
              genDesc = target.getAttribute("data-generated-description") || "";
              if (genDesc) {
                setEditedDescription(genDesc);
                setError(null);
              }
              break;
            case "data-category":
              // No need to update, we use context
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

  // We keep this for the UI but it doesn't do anything
  const handleCategoryChange = () => {
    // Category is now handled by context
  };

  const handleClose = () => {
    // Use context instead of events
    closeModal();
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 rounded-2xl border-white/10 shadow-2xl sm:max-w-[90vw] md:max-w-3xl text-white">
        <DialogHeader className="bg-white/5 pb-2 pt-4 rounded-t-xl">
          <DialogTitle className="flex items-center text-xl text-blue-100">
            <FileTextIcon className="mr-2 h-5 w-5" />
            Review Generated Description
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-4 pt-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <label htmlFor={originalNoteId} className="text-sm font-medium text-blue-100">
                  Original Note
                </label>
              </div>
              <Textarea
                id={originalNoteId}
                value={originalDescription}
                readOnly
                className="min-h-[100px] resize-none bg-white/5 border-white/10 text-blue-100/90"
                disabled={isLoading}
              />

              <div className="mt-4 space-y-2">
                <label htmlFor={categoryId} className="text-sm font-medium text-blue-100">
                  Priority
                </label>
                <div id={categoryId}>
                  <TaskCategoryToggle
                    taskId={-1}
                    currentCategory={category}
                    onCategoryChange={handleCategoryChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor={generatedDescriptionId} className="text-sm font-medium text-blue-100">
                  Generated Description
                </label>
                <span
                  className={`text-xs ${editedDescription.length > MAX_DESCRIPTION_LENGTH ? "text-rose-300" : "text-blue-100/70"}`}
                >
                  {editedDescription.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                id={generatedDescriptionId}
                value={editedDescription}
                onChange={handleDescriptionChange}
                className={`min-h-[220px] resize-none transition-colors bg-white/5 border-white/10 text-blue-100 ${error ? "border-rose-400" : ""}`}
                placeholder="Edit the generated description if needed..."
                disabled={isLoading}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "description-error" : undefined}
              />
              {error && (
                <p id="description-error" className="text-sm text-rose-300 mt-1">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
        <hr className="my-1 h-px w-full bg-white/10" />
        <DialogFooter className="flex items-center justify-between gap-2 px-6 py-4 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 border-white/20 text-blue-100 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isLoading || !!error}
            className="min-w-[180px] transition-all bg-white/10 text-blue-100 hover:bg-white/20 hover:text-white border border-white/20"
            size="default"
          >
            {isLoading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Creating Task...
              </>
            ) : (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                Accept & Create Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
