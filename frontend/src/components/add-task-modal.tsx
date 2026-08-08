"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Status } from "@/lib/types";

export default function AddTaskModal({
  status,
  label,
  onClose,
  onCreate,
}: {
  status: Status;
  label?: string;
  onClose: () => void;
  onCreate: (title: string, status: Status) => void;
}) {
  const [title, setTitle] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    onCreate(title.trim(), status);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border p-5"
        style={{ background: "var(--bg)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: "var(--text)" }}>{label ?? `Add task · ${status}`}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5"><X size={16} /></button>
        </div>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Task title"
          className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none mb-4"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3.5 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
            Cancel
          </button>
          <button onClick={submit} className="px-3.5 py-2 rounded-lg text-sm bg-neutral-900 text-white font-medium">
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
