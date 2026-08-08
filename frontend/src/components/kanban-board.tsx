"use client";

import Link from "next/link";
import { useState } from "react";
import { GripVertical, Plus, MoreHorizontal, Tag, Calendar } from "lucide-react";
import { Status, TaskItem } from "@/lib/types";
import PriorityBadge from "./priority-badge";
import Avatar from "./avatar";

const COLUMNS: Status[] = ["To Do", "Doing", "Completed", "On Hold"];

export default function KanbanBoard({
  tasksByStatus,
  onAddTask,
  onMoveTask,
}: {
  tasksByStatus: Record<string, TaskItem[]>;
  onAddTask: (status: Status) => void;
  onMoveTask?: (taskId: string, from: Status, to: Status) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);

  const findTask = (id: string): { task: TaskItem; status: Status } | null => {
    for (const s of COLUMNS) {
      const t = (tasksByStatus[s] ?? []).find((x) => x.id === id);
      if (t) return { task: t, status: s };
    }
    return null;
  };

  const handleDrop = (col: Status) => {
    setDragOverCol(null);
    if (!draggingId) return;
    const found = findTask(draggingId);
    if (found && found.status !== col) {
      onMoveTask?.(draggingId, found.status, col);
    }
    setDraggingId(null);
  };

  return (
    <div className="flex gap-4 px-6 pb-6 overflow-x-auto">
      {COLUMNS.map((col) => (
        <div
          key={col}
          className="w-[280px] shrink-0"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverCol(col);
          }}
          onDragLeave={() => setDragOverCol((c) => (c === col ? null : c))}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(col);
          }}
        >
          <div className="flex items-center gap-1.5 py-2 text-sm font-semibold" style={{ color: "var(--text)" }}>
            <GripVertical size={14} className="opacity-40" />
            {col}
            <span className="text-xs font-normal opacity-50">{(tasksByStatus[col] ?? []).length}</span>
            <button className="ml-auto p-1 rounded hover:bg-black/5" onClick={() => onAddTask(col)}><Plus size={15} /></button>
            <button className="p-1 rounded hover:bg-black/5"><MoreHorizontal size={15} /></button>
          </div>

          <div
            className="rounded-xl p-2 space-y-2 min-h-[80px] transition"
            style={{
              background: dragOverCol === col ? "color-mix(in srgb, var(--accent) 8%, var(--bg-subtle))" : "var(--bg-subtle)",
              outline: dragOverCol === col ? "2px dashed var(--accent)" : "none",
              outlineOffset: "-2px",
            }}
          >
            {(tasksByStatus[col] ?? []).map((t) => (
              <Link
                key={t.id}
                href={`/tasks/${t.id}`}
                draggable
                onDragStart={() => setDraggingId(t.id)}
                onDragEnd={() => setDraggingId(null)}
                className="block rounded-lg border p-3 hover:shadow-sm transition cursor-grab active:cursor-grabbing"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg)",
                  opacity: draggingId === t.id ? 0.4 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{t.title}</span>
                  <MoreHorizontal size={14} className="opacity-40 shrink-0 mt-0.5" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Avatar member={t.member} size={22} />
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "#fee2e2", color: "#dc2626" }}
                  >
                    <Calendar size={10} />
                    {t.dueDate}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.labels.map((l, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
                      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                    >
                      <Tag size={10} />
                      {l}
                    </span>
                  ))}
                </div>
              </Link>
            ))}

            <button
              onClick={() => onAddTask(col)}
              className="w-full flex items-center gap-1.5 px-2 py-2 text-sm rounded-lg hover:bg-black/5"
              style={{ color: "var(--text-muted)" }}
            >
              <Plus size={14} />
              Add Task
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
