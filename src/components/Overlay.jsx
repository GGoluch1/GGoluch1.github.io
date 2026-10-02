import { createPortal } from "react-dom";

// Renders full-screen effects straight into <body>, so a transformed
// ancestor can't trap their position: fixed.
export default function Overlay({ children }) {
  return createPortal(children, document.body);
}
