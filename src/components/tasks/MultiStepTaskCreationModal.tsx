"use client";

import { useState, useId, type ChangeEvent, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useModalContext } from "../contexts/ModalContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TaskCategoryToggle } from "./TaskCategoryToggle";
import { ReloadIcon, FileTextIcon, CheckIcon } from "@radix-ui/react-icons";
import type { CreateTaskCommand, TaskCategory } from "@/types";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

// Constants from original components
const MIN_NOTE_LENGTH = 3;
const MAX_NOTE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_DESCRIPTION_LENGTH = 10;

export const MultiStepTaskCreationModal = () => {
  const [step, setStep] = useState(0);
  const totalSteps = 2;

  // IDs for accessibility
  const noteId = useId();
  const originalNoteId = useId();
  const generatedDescriptionId = useId();
  const categoryId = useId();

  // Context from ModalContext
  const {
    isOpen,
    closeModal,
    description: generatedDescription,
    note: contextNote,
    category: contextCategory,
  } = useModalContext();

  // Debug log for context values
  console.log("Modal context values:", { isOpen, contextNote, contextCategory, generatedDescription });

  // Form state
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<TaskCategory>("B");
  const [editedDescription, setEditedDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when modal opens
  useEffect(() => {
    console.log("Modal open state changed:", isOpen);
    if (isOpen && contextNote) {
      setNote(contextNote);
    }
    if (isOpen && contextCategory) {
      setCategory(contextCategory);
    }
    if (isOpen && generatedDescription) {
      setEditedDescription(generatedDescription);
    }
  }, [isOpen, contextNote, contextCategory, generatedDescription]);

  // Step 1 validation and handlers
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

  // Step 2 validation and handlers
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

  // Handle modal closing
  const handleClose = () => {
    closeModal();
    setStep(0);
    setNote("");
    setCategory("B");
    setEditedDescription("");
    setError(null);
    setIsLoading(false);
  };

  // Step 1 submit handler - Calls AI API
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
        body: JSON.stringify({ description: note, userContext: "User context" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate description");
      }

      const data = await response.json();
      setEditedDescription(data.generatedDescription);

      console.log("dwescription: ", data.generatedDescription);

      // Move to next step
      setStep(1);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate description. Please try again.";
      toast.error(errorMessage);
      console.error("Error generating description:", error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 submit handler - Creates the task
  const handleCreateTask = async () => {
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

  // Handle back button
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} data-testid="task-creation-modal">
      <DialogContent className="max-w-3xl backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 rounded-2xl border border-white/10 shadow-2xl sm:max-w-[90vw] md:max-w-3xl text-white">
        <DialogHeader />
        <div className="p-4">
          <div className="flex items-center justify-center mb-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full transition-all duration-300 ease-in-out",
                    index <= step ? "bg-blue-200" : "bg-white/20"
                  )}
                />
                {index < totalSteps - 1 && (
                  <div className={cn("w-8 h-0.5", index < step ? "bg-blue-200" : "bg-white/20")} />
                )}
              </div>
            ))}
          </div>

          <Card className="shadow-lg border-0 backdrop-blur-lg bg-gradient-to-b from-white/5 to-white/0 text-white">
            <CardHeader className="bg-white/5 pb-2 pt-4 rounded-t-lg">
              <CardTitle className="flex items-center text-xl text-blue-100">
                <FileTextIcon className="mr-2 h-5 w-5" />
                {step === 0 ? "Create New Task" : "Review Generated Description"}
              </CardTitle>
              <CardDescription className="text-blue-100/70">
                Step {step + 1} of {totalSteps}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-5">
              {step === 0 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor={noteId} className="text-sm font-medium flex justify-between text-blue-100">
                      <span>Quick Note</span>
                      <span
                        className={`text-xs ${note.length > MAX_NOTE_LENGTH ? "text-rose-300" : "text-blue-100/70"}`}
                      >
                        {note.length}/{MAX_NOTE_LENGTH}
                      </span>
                    </label>
                    <Textarea
                      id={noteId}
                      placeholder="Enter a quick note about your task..."
                      value={note}
                      onChange={handleNoteChange}
                      className={`min-h-[100px] resize-none transition-colors bg-white/5 border-white/20 text-blue-100 placeholder:text-blue-100/50 ${error ? "border-rose-400" : ""}`}
                      disabled={isLoading}
                      aria-invalid={error ? "true" : "false"}
                      aria-describedby={error ? "note-error" : undefined}
                      data-testid="task-note-input"
                    />
                    {error && (
                      <p id="note-error" className="text-sm text-rose-300 mt-1">
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor={categoryId} className="text-sm font-medium text-blue-100">
                        Priority Category
                      </label>
                      <div id={categoryId} className="flex-shrink-0">
                        <TaskCategoryToggle
                          taskId={-1} // Placeholder ID, not used for new tasks
                          currentCategory={category}
                          onCategoryChange={handleCategoryChange}
                          disabled={isLoading}
                          data-testid="task-category-toggle-step0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor={originalNoteId} className="text-sm font-medium text-blue-100">
                          Original Note
                        </label>
                      </div>
                      <Textarea
                        id={originalNoteId}
                        value={note}
                        readOnly
                        className="min-h-[100px] resize-none bg-white/5 border-white/20 text-blue-100/80"
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
                        className={`min-h-[220px] resize-none transition-colors bg-white/5 border-white/20 text-blue-100 placeholder:text-blue-100/50 ${error ? "border-rose-400" : ""}`}
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
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-2 px-6 py-4 sm:justify-between bg-white/5 rounded-b-lg">
              {step === 0 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 border-white/20 text-blue-100 hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateDescription}
                    disabled={isLoading || !!error}
                    className="min-w-[170px] transition-all bg-white/10 text-blue-100 hover:bg-white/20 hover:text-white border border-white/20"
                    size="default"
                    data-testid="generate-description-button"
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
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="px-4 border-white/20 text-blue-100 hover:bg-white/10 hover:text-white"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateTask}
                    disabled={isLoading || !!error}
                    className="min-w-[180px] transition-all bg-white/10 text-blue-100 hover:bg-white/20 hover:text-white border border-white/20"
                    size="default"
                    data-testid="create-task-button"
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
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
