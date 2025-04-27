import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { TaskCategory } from "@/types";

interface ModalContextType {
  isOpen: boolean;
  openModal: (description: string, note: string, category: TaskCategory, id?: string) => void;
  closeModal: () => void;
  description: string;
  note: string;
  category: TaskCategory;
  id: string | undefined;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<TaskCategory>("B");
  const [id, setId] = useState<string | undefined>(undefined);

  const openModal = (description: string, note: string, category: TaskCategory, id?: string) => {
    console.log("Opening modal with data:", { description, note, category, id });
    setDescription(description);
    setNote(note);
    setCategory(category);
    setId(id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal, description, note, category, id }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return context;
}
