import React from "react";
import { ModalProvider } from "../contexts/ModalContext";
import { MultiStepTaskCreationModal } from "./MultiStepTaskCreationModal";
import { Toaster } from "@/components/ui/sonner";

export default function TaskFormWrapper() {
  return (
    <ModalProvider>
      <MultiStepTaskCreationModal />
      <Toaster />
    </ModalProvider>
  );
}
