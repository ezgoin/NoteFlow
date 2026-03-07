"use client";

import {
  type ReactNode,
  type MouseEvent,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Ensure we only render the portal on the client.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Drive the enter / exit animation.
  useEffect(() => {
    if (isOpen) {
      // Allow one frame so the DOM renders at opacity-0 before transitioning.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Close on Escape key.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Close when clicking the backdrop.
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={[
        "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={[
          "relative w-full max-w-lg rounded-xl bg-white shadow-xl transition-all duration-200",
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
        ].join(" ")}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Close button when there is no title bar */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
