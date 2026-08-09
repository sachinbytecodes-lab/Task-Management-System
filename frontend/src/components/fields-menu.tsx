"use client";

import { useState } from "react";
import { Columns3, List, LayoutGrid, Check } from "lucide-react";
import Dropdown from "./dropdown";
import { IconButton } from "./top-bar";

export type FieldKey = "priority" | "members" | "dueDate" | "labels" | "status" | "reporter";
export type ViewType = "list" | "board";

const ALL_FIELDS: { key: FieldKey; label: string }[] = [
  { key: "priority", label: "Priority" },
  { key: "members", label: "Members" },
  { key: "dueDate", label: "Due Date" },
  { key: "labels", label: "Labels" },
  { key: "status", label: "Status" },
  { key: "reporter", label: "Reporter" },
];

export default function FieldsMenu({
  view,
  onViewChange,
  fields,
  onFieldsChange,
}: {
  view: ViewType;
  onViewChange: (v: ViewType) => void;
  fields: Record<FieldKey, boolean>;
  onFieldsChange: (f: Record<FieldKey, boolean>) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <IconButton onClick={() => setOpen((o) => !o)} active={open}>
        <span className="flex items-center gap-1.5 text-sm font-medium px-0.5">
          <Columns3 size={16} />
          Fields
        </span>
      </IconButton>
      <Dropdown open={open} onClose={() => setOpen(false)} anchorClassName="right-0 top-full mt-2 w-64">
        <div className="flex gap-1 px-2 pb-2 mb-1 border-b" style={{ borderColor: "var(--border)" }}>
          <ToggleBtn active={view === "list"} onClick={() => onViewChange("list")}>
            <List size={14} /> List
          </ToggleBtn>
          <ToggleBtn active={view === "board"} onClick={() => onViewChange("board")}>
            <LayoutGrid size={14} /> Board
          </ToggleBtn>
        </div>
        {ALL_FIELDS.map((f) => (
          <label
            key={f.key}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-black/5"
            style={{ color: "var(--text)" }}
          >
            <span className="flex-1">{f.label}</span>
            <span
              onClick={() => onFieldsChange({ ...fields, [f.key]: !fields[f.key] })}
              className="w-4 h-4 rounded flex items-center justify-center border"
              style={{
                borderColor: fields[f.key] ? "var(--accent)" : "var(--border)",
                background: fields[f.key] ? "var(--accent)" : "transparent",
              }}
            >
              {fields[f.key] && <Check size={11} color="var(--accent-fg)" />}
            </span>
          </label>
        ))}
      </Dropdown>
    </div>
  );
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 text-sm py-1.5 rounded-md transition"
      style={{
        background: active ? "var(--bg)" : "transparent",
        color: "var(--text)",
        boxShadow: active ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
      }}
    >
      {children}
    </button>
  );
}
