"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Circle, BarChart2, Users, Calendar, Users2, Tag, User, Check, ChevronRight } from "lucide-react";
import Dropdown from "./dropdown";
import { IconButton } from "./top-bar";
import { Priority, Status, TaskItem } from "@/lib/types";
import { api } from "@/lib/api";

const PRIORITIES: Priority[] = ["No Priority", "Urgent", "High", "Medium", "Low"];
const STATUSES: Status[] = ["To Do", "Doing", "Completed", "On Hold"];

export interface FilterState {
  priority: Priority | null;
  status: Status | null;
  member: string | null; // member id
  reporter: string | null; // reporter id
  label: string | null;
  team: string | null;
}

type CategoryKey = "status" | "priority" | "members" | "dueDate" | "teams" | "labels" | "reporter";

export default function FilterMenu({
  filters,
  onFiltersChange,
  tasks,
}: {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  tasks: TaskItem[];
}) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<CategoryKey | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (open && users.length === 0) {
      api.getUsers().then(setUsers).catch(() => {});
    }
  }, [open, users.length]);

  const labelOptions = useMemo(() => Array.from(new Set(tasks.flatMap((t) => t.labels ?? []))), [tasks]);
  const teamOptions = useMemo(() => Array.from(new Set(tasks.flatMap((t) => t.teams ?? []))), [tasks]);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const CATEGORIES: { key: CategoryKey; label: string; icon: any }[] = [
    { key: "status", label: "Status", icon: Circle },
    { key: "priority", label: "Priority", icon: BarChart2 },
    { key: "members", label: "Members", icon: Users },
    { key: "dueDate", label: "Due Date", icon: Calendar },
    { key: "teams", label: "Teams", icon: Users2 },
    { key: "labels", label: "Labels", icon: Tag },
    { key: "reporter", label: "Reporter", icon: User },
  ];

  const set = (patch: Partial<FilterState>) => onFiltersChange({ ...filters, ...patch });

  return (
    <div className="relative">
      <IconButton onClick={() => { setOpen((o) => !o); setSub(null); }} active={open || activeCount > 0}>
        <span className="relative">
          <Filter size={17} />
          {activeCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center text-white"
              style={{ background: "var(--accent)" }}
            >
              {activeCount}
            </span>
          )}
        </span>
      </IconButton>
      <Dropdown open={open} onClose={() => setOpen(false)} anchorClassName="right-0 top-full mt-2 w-52">
        {activeCount > 0 && (
          <button
            onClick={() => onFiltersChange({ priority: null, status: null, member: null, reporter: null, label: null, team: null })}
            className="w-full text-left px-3 py-2 text-xs hover:bg-black/5"
            style={{ color: "var(--accent)" }}
          >
            Clear all filters
          </button>
        )}
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.key} className="relative">
              <button
                onClick={() => setSub(sub === c.key ? null : c.key)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5"
                style={{ color: "var(--text)", background: sub === c.key ? "var(--bg-subtle)" : "transparent" }}
              >
                <Icon size={15} />
                <span className="flex-1 text-left">{c.label}</span>
                <ChevronRight size={13} className="opacity-40" />
              </button>

              {sub === c.key && (
                <div
                  className="absolute right-full top-0 mr-1 w-48 max-h-64 overflow-y-auto rounded-xl border shadow-lg py-1.5"
                  style={{ background: "var(--bg)", borderColor: "var(--border)" }}
                >
                  {c.key === "priority" && (
                    <SubList
                      title="Priority"
                      options={PRIORITIES.map((p) => ({ value: p, label: p }))}
                      selected={filters.priority}
                      onSelect={(v) => set({ priority: filters.priority === v ? null : (v as Priority) })}
                    />
                  )}
                  {c.key === "status" && (
                    <SubList
                      title="Status"
                      options={STATUSES.map((s) => ({ value: s, label: s }))}
                      selected={filters.status}
                      onSelect={(v) => set({ status: filters.status === v ? null : (v as Status) })}
                    />
                  )}
                  {c.key === "members" && (
                    <SubList
                      title="Members"
                      options={users.map((u) => ({ value: u._id, label: u.fullName || u.email }))}
                      selected={filters.member}
                      onSelect={(v) => set({ member: filters.member === v ? null : v })}
                      empty="No members yet"
                    />
                  )}
                  {c.key === "reporter" && (
                    <SubList
                      title="Reporter"
                      options={users.map((u) => ({ value: u._id, label: u.fullName || u.email }))}
                      selected={filters.reporter}
                      onSelect={(v) => set({ reporter: filters.reporter === v ? null : v })}
                      empty="No reporters yet"
                    />
                  )}
                  {c.key === "labels" && (
                    <SubList
                      title="Labels"
                      options={labelOptions.map((l) => ({ value: l, label: l }))}
                      selected={filters.label}
                      onSelect={(v) => set({ label: filters.label === v ? null : v })}
                      empty="No labels used yet"
                    />
                  )}
                  {c.key === "teams" && (
                    <SubList
                      title="Teams"
                      options={teamOptions.map((t) => ({ value: t, label: t }))}
                      selected={filters.team}
                      onSelect={(v) => set({ team: filters.team === v ? null : v })}
                      empty="No teams used yet"
                    />
                  )}
                  {c.key === "dueDate" && (
                    <div className="px-3 py-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      Filtering by exact date range isn&apos;t available yet — due dates are free-text for now. Sort visually by scanning the Due Date column instead.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </Dropdown>
    </div>
  );
}

function SubList({
  title,
  options,
  selected,
  onSelect,
  empty,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (v: string) => void;
  empty?: string;
}) {
  return (
    <>
      <div className="px-3 py-1 text-xs" style={{ color: "var(--text-muted)" }}>{title}</div>
      {options.length === 0 && (
        <div className="px-3 py-2 text-xs" style={{ color: "var(--text-muted)" }}>{empty ?? "Nothing yet"}</div>
      )}
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onSelect(o.value)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-black/5"
          style={{ color: "var(--text)" }}
        >
          <span className="text-left truncate">{o.label}</span>
          {selected === o.value && <Check size={13} />}
        </button>
      ))}
    </>
  );
}
