import { useState, useCallback } from "react";

/**
 * useDisclosure is a standard hook for managing open/close states (modals, drawers, toggles).
 * This promotes reusability and clean component logic.
 */
export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, onOpen, onClose, onToggle };
}
