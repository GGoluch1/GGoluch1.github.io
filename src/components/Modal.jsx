import { useEffect, useRef } from "react";

// A native <dialog> shown with showModal(): focus is trapped, Escape closes it,
// and it renders in the browser's top layer above everything else.
// Clicking the dimmed backdrop also closes it. Mark the element that should get
// focus with data-autofocus (React's autoFocus fires before the dialog opens).
export default function Modal({ open, onClose, label, className = "", children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto border-2 border-magi bg-void p-0 font-mono text-magi backdrop:bg-black/80 backdrop:backdrop-blur-sm ${className}`}
    >
      {open && children}
    </dialog>
  );
}
