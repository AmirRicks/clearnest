"use client";

import { useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const ModalContext = createContext({
  onClose: () => {},
});

export function Modal({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const onClose = () => onOpenChange(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <ModalContext.Provider value={{ onClose }}>
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden
            />
            {children}
          </motion.div>
        </ModalContext.Provider>
      )}
    </AnimatePresence>
  );
}

export const ModalContent = ({
  className,
  children,
  maxWidth,
}: {
  className?: string;
  children?: React.ReactNode;
  maxWidth?: string;
}) => {
  const { onClose } = useContext(ModalContext);
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`relative w-full ${
        maxWidth || "max-w-md"
      } overflow-hidden rounded-3xl border border-stone/70 bg-background shadow-card ${className ?? ""}`}
    >
       <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full border border-stone/70 bg-paper text-graphite transition hover:text-charcoal"
      >
        <X className="h-4 w-4" />
      </button>
      {children}
    </motion.div>
  );
};

export const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 sm:p-7 ${className}`} {...props} />
);

export const ModalTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={`text-xl font-bold tracking-tight text-charcoal ${className}`} {...props} />
);

export const ModalBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 sm:px-7 ${className}`} {...props} />
);

export const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex justify-end gap-3 p-6 sm:p-7 bg-paper/50 border-t border-stone/60 ${className}`} {...props} />
);
