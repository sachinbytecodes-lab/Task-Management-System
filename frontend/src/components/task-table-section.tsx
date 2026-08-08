"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { TaskItem, Status } from "@/lib/types";
import TaskRow from "./task-row";
import { FieldKey } from "./fields-menu";

const HEADER_LABELS: { key: FieldKey; label: string; width: string }[] = [
  { key: "priority", label: "Priority", width: "w-28" },
  { key: "members", label: "Members", width: "w-28" },
  { key: "dueDate", label: "Due Date", width: "w-32" },
];

export default function TaskTableSection({
  status,
  tasks,
  fields,
  onAddTask,
}: {
  status: Status;
  tasks: TaskItem[];
  fields: Record<FieldKey, boolean>;
  onAddTask: (status: Status) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="px-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 py-3 text-sm font-medium"
        style={{ color: "var(--text)" }}
      >
        <ChevronDown size={14} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
        {status}
      </button>

      {open && (
        <div className="rounded-xl border overflow-hidden mb-6" style={{ borderColor: "var(--border)" }}>
          <div
            className="flex items-center px-4 py-3 text-xs font-medium"
            style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
          >
            <span className="flex-1">Task</span>
            {HEADER_LABELS.filter((h) => fields[h.key]).map((h) => (
              <span key={h.key} className={`${h.width} shrink-0`}>{h.label}</span>
            ))}
            <span className="w-16 shrink-0 text-right">Actions</span>
          </div>

          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} fields={fields} />
          ))}

          <button
            onClick={() => onAddTask(status)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm border-t hover:bg-black/[0.02]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <Plus size={15} />
            Add Task
          </button>
        </div>
      )}
    </div>
  );
}
