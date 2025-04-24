import React from "react";
import { ModalProvider } from "../contexts/ModalContext";
import TaskCreationForm from "./TaskCreationForm";
import ModalDialog from "./ModalDialog";
import { Toaster } from "@/components/ui/sonner";

export default function TaskFormWrapper() {
  return (
    <ModalProvider>
      <TaskCreationForm data-task-form />
      <ModalDialog data-modal-dialog />
      <Toaster />
    </ModalProvider>
  );
}
