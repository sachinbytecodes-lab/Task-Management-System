"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Status, Priority } from "@/lib/types";
import { api } from "@/lib/api";

const STATUSES: Status[] = ["To Do", "Doing", "Completed", "On Hold"];
const PRIORITIES: Priority[] = ["No Priority", "Urgent", "High", "Medium", "Low"];

export interface NewTaskPayload {
  title: string;
  status: string;
  priority: string;
  member?: string;
  reporter?: string;
  dueDate?: string;
  labels: string[];
  teams: string[];
}

export default function TaskFormModal({
  initialStatus,
  onClose,
  onCreate,
}: {
  initialStatus: Status;
  onClose: () => void;
  onCreate: (payload: NewTaskPayload) => void;
}) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<string>(initialStatus);
  const [priority, setPriority] = useState<string>("No Priority");
  const [member, setMember] = useState("");
  const [reporter, setReporter] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState("");
  const [teams, setTeams] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const submit = () => {
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      status,
      priority,
      member: member || undefined,
      reporter: reporter || undefined,
      dueDate: dueDate || undefined,
      labels: labels.split(",").map((l) => l.trim()).filter(Boolean),
      teams: teams.split(",").map((t) => t.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border p-5 max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--bg)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: "var(--text)" }}>Add task</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5"><X size={16} /></button>
        </div>

        <Field label="Title">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Task title"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg)" }}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg)" }}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Members">
            <select value={member} onChange={(e) => setMember(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg)" }}>
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.fullName || u.email}</option>)}
            </select>
          </Field>
          <Field label="Reporter">
            <select value={reporter} onChange={(e) => setReporter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg)" }}>
              <option value="">Me (default)</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.fullName || u.email}</option>)}
            </select>
          </Field>
          <Field label="Due Date">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg)" }} />
          </Field>
          <Field label="Teams" hint="comma-separated">
            <input value={teams} onChange={(e) => setTeams(e.target.value)} placeholder="Design, Engineering" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text)" }} />
          </Field>
        </div>

        <Field label="Labels" hint="comma-separated">
          <input value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="Research, Deployment" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text)" }} />
        </Field>

        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="px-3.5 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
            Cancel
          </button>
          <button onClick={submit} className="px-3.5 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
        {label} {hint && <span className="opacity-60 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
