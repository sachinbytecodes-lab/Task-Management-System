"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MoreHorizontal, Trash2 } from "lucide-react";
import TopBar from "@/components/top-bar";
import FieldsMenu, { FieldKey, ViewType } from "@/components/fields-menu";
import FilterMenu, { FilterState } from "@/components/filter-menu";
import TaskTableSection from "@/components/task-table-section";
import KanbanBoard from "@/components/kanban-board";
import TaskFormModal, { NewTaskPayload } from "@/components/task-form-modal";
import Dropdown from "@/components/dropdown";
import { tasksByStatus as mockTasksByStatus, projects as mockProjects } from "@/lib/mock-data";
import { Status, TaskItem } from "@/lib/types";
import { gradientForId } from "@/lib/avatar-gradient";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const STATUSES: Status[] = ["To Do", "Doing", "Completed", "On Hold"];
const emptyFilters: FilterState = { priority: null, status: null, member: null, label: null, reporter: null, team: null };

function toMember(m: any) {
  if (!m) return null;
  return { id: m._id, name: m.fullName || m.email, initials: (m.fullName || m.email || "?")[0], avatarGradient: gradientForId(m._id) };
}

function groupByStatus(tasks: any[]): Record<string, TaskItem[]> {
  const out: Record<string, TaskItem[]> = { "To Do": [], Doing: [], Completed: [], "On Hold": [] };
  for (const t of tasks) {
    const item: TaskItem = {
      id: t._id ?? t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      member: toMember(t.member),
      reporter: toMember(t.reporter),
      dueDate: t.dueDate ?? "—",
      labels: t.labels ?? [],
      teams: t.teams ?? [],
    };
    (out[t.status] ??= []).push(item);
  }
  return out;
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { apiConnected, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usingApi, setUsingApi] = useState(false);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, TaskItem[]>>({ "To Do": [], Doing: [], Completed: [], "On Hold": [] });
  const [view, setView] = useState<ViewType>("list");
  const [menuOpen, setMenuOpen] = useState(false);
  const [fields, setFields] = useState<Record<FieldKey, boolean>>({
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
    status: false,
    reporter: false,
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [modalStatus, setModalStatus] = useState<Status | null>(null);

  useEffect(() => {
    // Wait for auth to resolve first — see tasks/page.tsx for why: deciding
    // mock-vs-real before we actually know if the API is reachable is what
    // caused demo data to flash on screen before real data replaced it.
    if (authLoading) return;

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
            setData(groupByStatus(tasks));
            setUsingApi(true);
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
        setData(mockTasksByStatus);
        setUsingApi(false);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, apiConnected, authLoading]);

  const filtered = useMemo(() => {
    const out: Record<string, TaskItem[]> = {};
    for (const s of STATUSES) {
      out[s] = (data[s] ?? [])
        .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
        .filter((t) => !filters.priority || t.priority === filters.priority)
        .filter((t) => !filters.status || t.status === filters.status)
        .filter((t) => !filters.member || t.member?.id === filters.member)
        .filter((t) => !filters.reporter || t.reporter?.id === filters.reporter)
        .filter((t) => !filters.label || t.labels.includes(filters.label as string))
        .filter((t) => !filters.team || (t.teams ?? []).includes(filters.team as string));
    }
    return out;
  }, [data, search, filters]);

  const totalVisible = STATUSES.reduce((sum, s) => sum + (filtered[s]?.length ?? 0), 0);
  const isFiltering = search.trim().length > 0 || Object.values(filters).some(Boolean);

  const addTask = async (payload: NewTaskPayload) => {
    const withProject = { ...payload, project: params.id };
    if (usingApi) {
      try {
        const created = await api.createTask(withProject);
        setData((d) => ({ ...d, [payload.status]: [...(d[payload.status] ?? []), ...groupByStatus([created])[payload.status]] }));
        return;
      } catch {
        // fall through to local add
      }
    }
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: payload.title,
      status: payload.status as Status,
      priority: payload.priority as TaskItem["priority"],
      member: null,
      dueDate: payload.dueDate ?? "—",
      labels: payload.labels,
      teams: payload.teams,
    };
    setData((d) => ({ ...d, [payload.status]: [...(d[payload.status] ?? []), newTask] }));
  };

  const moveTask = async (taskId: string, from: Status, to: Status) => {
    setData((d) => {
      const task = (d[from] ?? []).find((t) => t.id === taskId);
      if (!task) return d;
      return {
        ...d,
        [from]: (d[from] ?? []).filter((t) => t.id !== taskId),
        [to]: [...(d[to] ?? []), { ...task, status: to }],
      };
    });
    if (usingApi) {
      try {
        await api.updateTask(taskId, { status: to });
      } catch {
        // optimistic update already applied
      }
    }
  };

  const deleteTask = async (taskId: string, status: Status) => {
    setData((d) => ({ ...d, [status]: (d[status] ?? []).filter((t) => t.id !== taskId) }));
    if (usingApi) {
      try {
        await api.deleteTask(taskId);
      } catch {
        // already removed optimistically
      }
    }
  };

  const clearColumn = async (status: Status) => {
    const ids = (data[status] ?? []).map((t) => t.id);
    setData((d) => ({ ...d, [status]: [] }));
    if (usingApi) {
      await Promise.allSettled(ids.map((id) => api.deleteTask(id)));
    }
  };

  const deleteProject = async () => {
    if (!confirm(`Delete "${projectName ?? "this project"}"? Its tasks will stay on the Tasks page but will no longer be linked to it.`)) return;
    if (usingApi) {
      try {
        await api.deleteProject(params.id);
      } catch {
        // proceed to navigate away regardless
      }
    }
    router.push("/projects");
  };

  return (
    <div>
      <TopBar
        title="Tasks"
        breadcrumb={
          <div className="text-sm flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Link href="/projects" className="hover:underline">Projects</Link>
            <span>&gt;</span>
            <span style={{ color: "var(--text)" }}>{projectName ?? "…"}</span>
          </div>
        }
        searchOpen={searchOpen}
        onToggleSearch={() => setSearchOpen((o) => !o)}
        searchValue={search}
        onSearchChange={setSearch}
        fieldsSlot={<FieldsMenu view={view} onViewChange={setView} fields={fields} onFieldsChange={setFields} />}
        filterSlot={<FilterMenu filters={filters} onFiltersChange={setFilters} items={Object.values(data).flat()} />}
        onAdd={() => setModalStatus("To Do")}
        rightSlot={
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="p-2.5 rounded-lg border hover:bg-black/5" style={{ borderColor: "var(--border)", color: "var(--text)" }} title="Project actions">
              <MoreHorizontal size={17} />
            </button>
            <Dropdown open={menuOpen} onClose={() => setMenuOpen(false)} anchorClassName="right-0 top-full mt-2 w-48">
              <button
                onClick={() => { setMenuOpen(false); deleteProject(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5"
                style={{ color: "#dc2626" }}
              >
                <Trash2 size={14} /> Delete project
              </button>
            </Dropdown>
          </div>
        }
      />

      {loading ? (
        <div className="px-6 text-sm" style={{ color: "var(--text-muted)" }}>Loading…</div>
      ) : isFiltering && totalVisible === 0 ? (
        <div className="px-6 py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Match not found.
        </div>
      ) : view === "list" ? (
        <div className="pb-10">
          {STATUSES.map((s) => (
            <TaskTableSection key={s} status={s} tasks={filtered[s] ?? []} fields={fields} onAddTask={setModalStatus} />
          ))}
        </div>
      ) : (
        <KanbanBoard tasksByStatus={filtered} onAddTask={setModalStatus} onMoveTask={moveTask} onClearColumn={clearColumn} onDeleteTask={deleteTask} />
      )}

      {modalStatus && (
        <TaskFormModal
          initialStatus={modalStatus}
          defaultProjectId={typeof params.id === "string" ? params.id : undefined}
          onClose={() => setModalStatus(null)}
          onCreate={addTask}
        />
      )}
    </div>
  );
}
