"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PanelLeft } from "lucide-react";
import TaskTableSection from "@/components/task-table-section";
import { tasksByStatus as mockTasksByStatus, projects as mockProjects } from "@/lib/mock-data";
import { Status, TaskItem } from "@/lib/types";
import { gradientForId } from "@/lib/avatar-gradient";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const STATUSES: Status[] = ["To Do", "Doing", "Completed", "On Hold"];
const FIELDS = { priority: true, members: true, dueDate: true, labels: false, status: false, reporter: false };

function groupByStatus(tasks: any[]): Record<string, TaskItem[]> {
  const out: Record<string, TaskItem[]> = { "To Do": [], Doing: [], Completed: [], "On Hold": [] };
  for (const t of tasks) {
    const item: TaskItem = {
      id: t._id ?? t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      member: t.member ? { id: t.member._id, name: t.member.fullName, initials: (t.member.fullName ?? "?")[0], avatarGradient: gradientForId(t.member._id) } : null,
      dueDate: t.dueDate ?? "—",
      labels: t.labels ?? [],
    };
    (out[t.status] ??= []).push(item);
  }
  return out;
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { apiConnected } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [tasksByStatus, setTasksByStatus] = useState<Record<string, TaskItem[]>>(mockTasksByStatus);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      if (apiConnected) {
        try {
          const [project, tasks] = await Promise.all([
            api.getProject(params.id),
            api.getTasks(params.id),
          ]);
          if (!cancelled) {
            setProjectName(project.name);
            setTasksByStatus(groupByStatus(tasks));
            setLoading(false);
          }
          return;
        } catch {
          // Not a real project id (e.g. mock project) — fall through to mock display
        }
      }
      if (!cancelled) {
        const mock = mockProjects.find((p) => p.id === params.id);
        setProjectName(mock?.name ?? "Project");
        setTasksByStatus(mockTasksByStatus);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, apiConnected]);

  return (
    <div>
      <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <button className="p-1 rounded hover:bg-black/5"><PanelLeft size={18} style={{ color: "var(--text)" }} /></button>
        <div className="w-px h-4" style={{ background: "var(--border)" }} />
        <div className="text-sm flex items-center gap-1.5">
          <Link href="/projects" className="hover:underline" style={{ color: "var(--text-muted)" }}>Projects</Link>
          <span style={{ color: "var(--text-muted)" }}>&gt;</span>
          <span style={{ color: "var(--text)" }}>{projectName ?? "…"}</span>
        </div>
      </div>

      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Tasks</h1>
      </div>

      {loading ? (
        <div className="px-6 text-sm" style={{ color: "var(--text-muted)" }}>Loading…</div>
      ) : (
        <div className="pb-10">
          {STATUSES.map((s) => (
            <TaskTableSection key={s} status={s} tasks={tasksByStatus[s] ?? []} fields={FIELDS} onAddTask={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
