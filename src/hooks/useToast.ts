import { useState } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type };
    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, dismissToast };
};
