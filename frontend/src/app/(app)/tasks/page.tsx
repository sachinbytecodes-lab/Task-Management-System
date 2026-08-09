"use client";

import { useEffect, useMemo, useState } from "react";
import TopBar from "@/components/top-bar";
import FieldsMenu, { FieldKey, ViewType } from "@/components/fields-menu";
import FilterMenu, { FilterState } from "@/components/filter-menu";
import TaskTableSection from "@/components/task-table-section";
import KanbanBoard from "@/components/kanban-board";
import TaskFormModal, { NewTaskPayload } from "@/components/task-form-modal";
import { tasksByStatus as mockData } from "@/lib/mock-data";
import { Status, TaskItem } from "@/lib/types";
import { gradientForId } from "@/lib/avatar-gradient";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const STATUSES: Status[] = ["To Do", "Doing", "Completed", "On Hold"];

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

const emptyFilters: FilterState = { priority: null, status: null, member: null, label: null, reporter: null, team: null };

export default function TasksPage() {
  const { apiConnected } = useAuth();
  const [data, setData] = useState<Record<string, TaskItem[]>>(mockData);
  const [usingApi, setUsingApi] = useState(false);
  const [view, setView] = useState<ViewType>("list");
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
    if (!apiConnected) return;
    api
      .getTasks()
      .then((tasks) => {
        setData(groupByStatus(tasks));
        setUsingApi(true);
      })
      .catch(() => setUsingApi(false));
  }, [apiConnected]);

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
    if (usingApi) {
      try {
        const created = await api.createTask(payload);
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
        // optimistic update already applied; ignore network errors here
      }
    }
  };

  return (
    <div>
      <TopBar
        title="Tasks"
        onToggleSidebar={() => {}}
        searchOpen={searchOpen}
        onToggleSearch={() => setSearchOpen((o) => !o)}
        searchValue={search}
        onSearchChange={setSearch}
        fieldsSlot={<FieldsMenu view={view} onViewChange={setView} fields={fields} onFieldsChange={setFields} />}
        filterSlot={<FilterMenu filters={filters} onFiltersChange={setFilters} tasks={Object.values(data).flat()} />}
        onAdd={() => setModalStatus("To Do")}
      />

      {isFiltering && totalVisible === 0 ? (
        <div className="px-6 py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Match not found.
        </div>
      ) : view === "list" ? (
        <div className="pb-10">
          {STATUSES.map((s) => (
            <TaskTableSection
              key={s}
              status={s}
              tasks={filtered[s] ?? []}
              fields={fields}
              onAddTask={setModalStatus}
            />
          ))}
        </div>
      ) : (
        <KanbanBoard tasksByStatus={filtered} onAddTask={setModalStatus} onMoveTask={moveTask} />
      )}

      {modalStatus && (
        <TaskFormModal initialStatus={modalStatus} onClose={() => setModalStatus(null)} onCreate={addTask} />
      )}
    </div>
  );
}
