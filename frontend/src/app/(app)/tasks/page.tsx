"use client";

import { useEffect, useMemo, useState } from "react";
import TopBar from "@/components/top-bar";
import FieldsMenu, { FieldKey, ViewType } from "@/components/fields-menu";
import FilterMenu from "@/components/filter-menu";
import TaskTableSection from "@/components/task-table-section";
import KanbanBoard from "@/components/kanban-board";
import AddTaskModal from "@/components/add-task-modal";
import { tasksByStatus as mockData } from "@/lib/mock-data";
import { Priority, Status, TaskItem } from "@/lib/types";
import { gradientForId } from "@/lib/avatar-gradient";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const STATUSES: Status[] = ["To Do", "Doing", "Completed", "On Hold"];

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
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);
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
        .filter((t) => !priorityFilter || t.priority === priorityFilter);
    }
    return out;
  }, [data, search, priorityFilter]);

  const addTask = async (title: string, status: Status) => {
    if (usingApi) {
      try {
        const created = await api.createTask({ title, status });
        setData((d) => ({ ...d, [status]: [...(d[status] ?? []), ...groupByStatus([created])[status]] }));
        return;
      } catch {
        // fall through to local add
      }
    }
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title,
      status,
      priority: "No Priority",
      member: null,
      dueDate: "—",
      labels: [],
    };
    setData((d) => ({ ...d, [status]: [...(d[status] ?? []), newTask] }));
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
        filterSlot={<FilterMenu priority={priorityFilter} onPriorityChange={setPriorityFilter} />}
        onAdd={() => setModalStatus("To Do")}
      />

      {view === "list" ? (
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
        <AddTaskModal status={modalStatus} onClose={() => setModalStatus(null)} onCreate={addTask} />
      )}
    </div>
  );
}
