import { useEffect, useRef } from "react";

interface IModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onOutsideClick?: (e: MouseEvent) => boolean | void;
}

const Modal = ({ open, onClose, children, onOutsideClick }: IModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // close modal when press esc key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // close modal when clicking outside the panel
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !panelRef.current) return;
      const clickedOutside = !panelRef.current.contains(target);
      if (!clickedOutside) return;
      // Give parent first chance to handle (e.g., swap to the other modal)
      if (onOutsideClick && onOutsideClick(e)) return;
      // Otherwise, close as usual
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose, onOutsideClick]);

  return <>{open && <div ref={panelRef}>{children}</div>}</>;
};

export default Modal;
