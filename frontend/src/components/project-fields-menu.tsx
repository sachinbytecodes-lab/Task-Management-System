"use client";

import { useState } from "react";
import { Columns3, Check } from "lucide-react";
import Dropdown from "./dropdown";
import { IconButton } from "./top-bar";

export type ProjectFieldKey = "status" | "priority" | "lead" | "dueDate" | "labels" | "teams" | "reporter";

const ALL_FIELDS: { key: ProjectFieldKey; label: string }[] = [
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "lead", label: "Lead" },
  { key: "dueDate", label: "Due Date" },
  { key: "labels", label: "Labels" },
  { key: "teams", label: "Teams" },
  { key: "reporter", label: "Reporter" },
];

export default function ProjectFieldsMenu({
  fields,
  onFieldsChange,
}: {
  fields: Record<ProjectFieldKey, boolean>;
  onFieldsChange: (f: Record<ProjectFieldKey, boolean>) => void;
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
      <Dropdown open={open} onClose={() => setOpen(false)} anchorClassName="right-0 top-full mt-2 w-56">
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
