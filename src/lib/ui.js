// Tiny event bus so any component (the terminal, the comms list, the footer)
// can open a panel that lives somewhere else: "terminal", "idcard", "gendo".

const listeners = new Map();

export function openUi(name) {
  listeners.get(name)?.forEach((fn) => fn());
}

export function onUi(name, fn) {
  if (!listeners.has(name)) listeners.set(name, new Set());
  listeners.get(name).add(fn);
  return () => listeners.get(name).delete(fn);
}

// True while a modal <dialog> is open, so global shortcuts and idle eggs stay quiet.
export const dialogOpen = () => Boolean(document.querySelector("dialog[open]"));
