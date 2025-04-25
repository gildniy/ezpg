"use client";

// Simplified toast implementation
import { createContext, useContext } from "react";

type ToastProps = {
  title?: string;
  description?: string;
  duration?: number;
};

const ToastContext = createContext<{
  toast: (props: ToastProps) => void;
}>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const toast = (props: ToastProps) => {
  console.log("Toast:", props.title, props.description);
  // In a real implementation, this would show a toast notification
  // For now, we'll just log to the console
};
