"use client";

import Link from "next/link";
import { useState } from "react";
import { GripVertical, Plus, MoreHorizontal, Tag, Calendar, ArrowUpDown, Trash2, ChevronsUpDown } from "lucide-react";
import { Status, TaskItem } from "@/lib/types";
import PriorityBadge from "./priority-badge";
import Avatar from "./avatar";
import Dropdown from "./dropdown";

const COLUMNS: Status[] = ["To Do", "Doing", "Completed", "On Hold"];
const PRIORITY_RANK: Record<string, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3, "No Priority": 4 };

export default function KanbanBoard({
  tasksByStatus,
  onAddTask,
  onMoveTask,
  onClearColumn,
  onDeleteTask,
}: {
  tasksByStatus: Record<string, TaskItem[]>;
  onAddTask: (status: Status) => void;
  onMoveTask?: (taskId: string, from: Status, to: Status) => void;
  onClearColumn?: (status: Status) => void;
  onDeleteTask?: (taskId: string, status: Status) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
  const [collapsedCols, setCollapsedCols] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<Record<string, "priority" | "dueDate" | null>>({});
  const [menuOpenCol, setMenuOpenCol] = useState<Status | null>(null);
  const [cardMenuOpen, setCardMenuOpen] = useState<string | null>(null);

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

  const sortedTasks = (col: Status) => {
    const tasks = [...(tasksByStatus[col] ?? [])];
    const sort = sortBy[col];
    if (sort === "priority") tasks.sort((a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9));
    if (sort === "dueDate") tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return tasks;
  };

  return (
    <div className="flex gap-4 px-6 pb-6 overflow-x-auto">
      {COLUMNS.map((col) => {
        const collapsed = collapsedCols[col];
        return (
          <div
            key={col}
            className={collapsed ? "w-[64px] shrink-0" : "w-[280px] shrink-0"}
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
              <button
                onClick={() => setCollapsedCols((c) => ({ ...c, [col]: !c[col] }))}
                title={collapsed ? "Expand column" : "Collapse column"}
                className="p-0.5 rounded hover:bg-black/5"
              >
                <GripVertical size={14} className="opacity-40" />
              </button>
              {!collapsed && (
                <>
                  {col}
                  <span className="text-xs font-normal opacity-50">{(tasksByStatus[col] ?? []).length}</span>
                  <button className="ml-auto p-1 rounded hover:bg-black/5" onClick={() => onAddTask(col)} title="Add task">
                    <Plus size={15} />
                  </button>
                  <div className="relative">
                    <button
                      className="p-1 rounded hover:bg-black/5"
                      onClick={() => setMenuOpenCol(menuOpenCol === col ? null : col)}
                      title="Column actions"
                    >
                      <MoreHorizontal size={15} />
                    </button>
                    <Dropdown open={menuOpenCol === col} onClose={() => setMenuOpenCol(null)} anchorClassName="right-0 top-full mt-1 w-48">
                      <button
                        onClick={() => {
                          setSortBy((s) => ({ ...s, [col]: "priority" }));
                          setMenuOpenCol(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5"
                        style={{ color: "var(--text)" }}
                      >
                        <ArrowUpDown size={14} /> Sort by priority
                      </button>
                      <button
                        onClick={() => {
                          setSortBy((s) => ({ ...s, [col]: "dueDate" }));
                          setMenuOpenCol(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5"
                        style={{ color: "var(--text)" }}
                      >
                        <ArrowUpDown size={14} /> Sort by due date
                      </button>
                      <button
                        onClick={() => {
                          setCollapsedCols((c) => ({ ...c, [col]: true }));
                          setMenuOpenCol(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5"
                        style={{ color: "var(--text)" }}
                      >
                        <ChevronsUpDown size={14} /> Collapse column
                      </button>
                      <div className="my-1 h-px" style={{ background: "var(--border)" }} />
                      <button
                        onClick={() => {
                          if ((tasksByStatus[col] ?? []).length === 0) return;
                          if (confirm(`Delete all ${(tasksByStatus[col] ?? []).length} task(s) in "${col}"? This can't be undone.`)) {
                            onClearColumn?.(col);
                          }
                          setMenuOpenCol(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5"
                        style={{ color: "#dc2626" }}
                      >
                        <Trash2 size={14} /> Clear column
                      </button>
                    </Dropdown>
                  </div>
                </>
              )}
            </div>

            {!collapsed && (
              <div
                className="rounded-xl p-2 space-y-2 min-h-[80px] transition"
                style={{
                  background: dragOverCol === col ? "color-mix(in srgb, var(--accent) 8%, var(--bg-subtle))" : "var(--bg-subtle)",
                  outline: dragOverCol === col ? "2px dashed var(--accent)" : "none",
                  outlineOffset: "-2px",
                }}
              >
                {sortedTasks(col).map((t) => (
                  <div key={t.id} className="relative">
                    <Link
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
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCardMenuOpen(cardMenuOpen === t.id ? null : t.id);
                          }}
                          className="p-0.5 rounded hover:bg-black/5 shrink-0"
                        >
                          <MoreHorizontal size={14} className="opacity-40" />
                        </button>
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
                    <Dropdown open={cardMenuOpen === t.id} onClose={() => setCardMenuOpen(null)} anchorClassName="right-2 top-8 w-40">
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${t.title}"?`)) onDeleteTask?.(t.id, col);
                          setCardMenuOpen(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5"
                        style={{ color: "#dc2626" }}
                      >
                        <Trash2 size={13} /> Delete task
                      </button>
                    </Dropdown>
                  </div>
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
            )}
          </div>
        );
      })}
    </div>
  );
}
