"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Priority } from "@/lib/types";
import { api } from "@/lib/api";

const PRIORITIES: Priority[] = ["No Priority", "Urgent", "High", "Medium", "Low"];

export interface NewSubtaskPayload {
  title: string;
  priority: string;
  member?: string;
  dueDate?: string;
}

export default function SubtaskFormModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (payload: NewSubtaskPayload) => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("No Priority");
  const [member, setMember] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const submit = () => {
    if (!title.trim()) return;
    onCreate({ title: title.trim(), priority, member: member || undefined, dueDate: dueDate || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border p-5"
        style={{ background: "var(--bg)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: "var(--text)" }}>Add subtask</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5"><X size={16} /></button>
        </div>

        <Field label="Title">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Subtask title"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg)" }}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Due Date">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg)" }} />
          </Field>
        </div>

        <Field label="Member">
          <select value={member} onChange={(e) => setMember(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg)" }}>
            <option value="">Unassigned</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.fullName || u.email}</option>)}
          </select>
        </Field>

        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="px-3.5 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
            Cancel
          </button>
          <button onClick={submit} className="px-3.5 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
            Add Subtask
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</label>
      {children}
    </div>
  );
}
