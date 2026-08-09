"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { TaskItem } from "@/lib/types";
import PriorityBadge from "./priority-badge";
import Avatar from "./avatar";
import { FieldKey } from "./fields-menu";

export default function TaskRow({ task, fields }: { task: TaskItem; fields: Record<FieldKey, boolean> }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center px-4 py-3.5 border-t text-sm hover:bg-black/[0.02] transition"
      style={{ borderColor: "var(--border)" }}
    >
      <span className="flex-1 font-medium min-w-0 truncate pr-2" style={{ color: "var(--text)" }}>{task.title}</span>
      {fields.priority && (
        <span className="w-28 shrink-0">
          <PriorityBadge priority={task.priority} />
        </span>
      )}
      {fields.members && (
        <span className="w-24 shrink-0">
          <Avatar member={task.member} size={26} />
        </span>
      )}
      {fields.dueDate && (
        <span className="w-28 shrink-0" style={{ color: "var(--text)" }}>{task.dueDate}</span>
      )}
      {fields.status && (
        <span className="w-24 shrink-0 text-xs" style={{ color: "var(--text-muted)" }}>{task.status}</span>
      )}
      {fields.labels && (
        <span className="w-32 shrink-0 flex flex-wrap gap-1">
          {task.labels.length === 0 && <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>}
          {task.labels.slice(0, 2).map((l) => (
            <span key={l} className="text-[11px] px-1.5 py-0.5 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              {l}
            </span>
          ))}
          {task.labels.length > 2 && <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>+{task.labels.length - 2}</span>}
        </span>
      )}
      {fields.reporter && (
        <span className="w-24 shrink-0">
          <Avatar member={task.reporter} size={26} />
        </span>
      )}
      <span className="w-16 shrink-0 flex justify-end">
        <MoreHorizontal size={16} className="opacity-50" />
      </span>
    </Link>
  );
}
