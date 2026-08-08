"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PanelLeft } from "lucide-react";
import TaskTableSection from "@/components/task-table-section";
import { tasksByStatus } from "@/lib/mock-data";
import { projects } from "@/lib/mock-data";
import { Status } from "@/lib/types";

const STATUSES: Status[] = ["To Do", "Doing", "Completed", "On Hold"];
const FIELDS = { priority: true, members: true, dueDate: true, labels: false, status: false, reporter: false };

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const project = projects.find((p) => p.id === params.id);

  return (
    <div>
      <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <button className="p-1 rounded hover:bg-black/5"><PanelLeft size={18} style={{ color: "var(--text)" }} /></button>
        <div className="w-px h-4" style={{ background: "var(--border)" }} />
        <div className="text-sm flex items-center gap-1.5">
          <Link href="/projects" className="hover:underline" style={{ color: "var(--text-muted)" }}>Projects</Link>
          <span style={{ color: "var(--text-muted)" }}>&gt;</span>
          <span style={{ color: "var(--text)" }}>{project?.name ?? "Project"}</span>
        </div>
      </div>

      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Tasks</h1>
      </div>

      <div className="pb-10">
        {STATUSES.map((s) => (
          <TaskTableSection key={s} status={s} tasks={tasksByStatus[s] ?? []} fields={FIELDS} onAddTask={() => {}} />
        ))}
      </div>
    </div>
  );
}
