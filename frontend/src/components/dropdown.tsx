"use client";

import { useEffect, useRef, ReactNode } from "react";

export default function Dropdown({
  open,
  onClose,
  anchorClassName = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  anchorClassName?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={`absolute z-50 rounded-xl border shadow-lg py-1.5 ${anchorClassName}`}
      style={{ background: "var(--bg)", borderColor: "var(--border)" }}
    >
      {children}
    </div>
  );
}
