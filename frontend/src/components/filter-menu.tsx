"use client";

import { useState } from "react";
import { Filter, Circle, BarChart2, Users, Calendar, Users2, Tag, User, Check, ChevronRight } from "lucide-react";
import Dropdown from "./dropdown";
import { IconButton } from "./top-bar";
import { Priority } from "@/lib/types";

const PRIORITIES: Priority[] = ["No Priority", "Urgent", "High", "Medium", "Low"];
const CATEGORIES = [
  { key: "status", label: "Status", icon: Circle },
  { key: "priority", label: "Priority", icon: BarChart2 },
  { key: "members", label: "Members", icon: Users },
  { key: "dueDate", label: "Due Date", icon: Calendar },
  { key: "teams", label: "Teams", icon: Users2 },
  { key: "labels", label: "Labels", icon: Tag },
  { key: "reporter", label: "Reporter", icon: User },
] as const;

export default function FilterMenu({
  priority,
  onPriorityChange,
}: {
  priority: Priority | null;
  onPriorityChange: (p: Priority | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);

  return (
    <div className="relative">
      <IconButton onClick={() => { setOpen((o) => !o); setSub(null); }} active={open || !!priority}>
        <Filter size={17} />
      </IconButton>
      <Dropdown open={open} onClose={() => setOpen(false)} anchorClassName="right-0 top-full mt-2 w-52">
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
              {c.key === "priority" && sub === "priority" && (
                <div
                  className="absolute right-full top-0 mr-1 w-44 rounded-xl border shadow-lg py-1.5"
                  style={{ background: "var(--bg)", borderColor: "var(--border)" }}
                >
                  <div className="px-3 py-1 text-xs" style={{ color: "var(--text-muted)" }}>Priority</div>
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => onPriorityChange(priority === p ? null : p)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5"
                      style={{ color: "var(--text)" }}
                    >
                      <span className="flex-1 text-left">{p}</span>
                      {priority === p && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </Dropdown>
    </div>
  );
}
