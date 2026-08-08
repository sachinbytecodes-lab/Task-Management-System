"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lock, Eye, Share2, MoreHorizontal, PanelRight, ChevronDown, Plus, Settings,
  Paperclip, Send, Smile, MoreVertical, Calendar, Check,
} from "lucide-react";
import TopBar from "@/components/top-bar";
import Avatar from "./avatar";
import PriorityBadge from "@/components/priority-badge";
import Dropdown from "@/components/dropdown";
import MiniCalendar from "@/components/mini-calendar";
import { taskDetail, subtasks, comments, currentUser } from "@/lib/mock-data";
import { Priority } from "@/lib/types";

const PRIORITIES: Priority[] = ["No Priority", "Urgent", "High", "Medium", "Low"];

export default function TaskDetailClient() {
  const [priority, setPriority] = useState<Priority>(taskDetail.priority);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [reply, setReply] = useState("");

  return (
    <div>
      <TopBar
        title=""
        breadcrumb={
          <div className="text-sm flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Link href="/tasks" className="hover:underline">Tasks</Link>
          </div>
        }
        onAdd={() => {}}
        addLabel="Add Task"
      />
      <div className="hidden" />

      <div className="flex">
        <div className="flex-1 min-w-0 px-8 py-6 max-w-3xl">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{taskDetail.title}</h1>
            <div className="flex items-center gap-2 shrink-0">
              <IconBtn><Lock size={15} /></IconBtn>
              <IconBtn><Eye size={15} /><span className="text-xs ml-1">1</span></IconBtn>
              <IconBtn><Share2 size={15} /></IconBtn>
              <IconBtn><MoreHorizontal size={15} /></IconBtn>
              <IconBtn><PanelRight size={15} /></IconBtn>
            </div>
          </div>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>{taskDetail.description}</p>

          <Field label="Properties">
            <span
              className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full border"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              A {taskDetail.assignee}
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full"
              style={{ background: "#fee2e2", color: "#dc2626" }}
            >
              <Calendar size={12} /> {taskDetail.dueDate}
            </span>
          </Field>

          <Field label="Labels">
            {taskDetail.labels.map((l) => (
              <span
                key={l}
                className="text-sm px-2.5 py-1 rounded-full border"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                {l}
              </span>
            ))}
          </Field>

          <Field label="Resources">
            <button className="text-sm flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <Paperclip size={14} /> Add document or link…
            </button>
          </Field>

          <div className="flex items-center gap-1.5 mt-6 mb-2">
            <ChevronDown size={14} />
            <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Subtasks</h2>
          </div>
          <div className="rounded-xl border overflow-hidden mb-8" style={{ borderColor: "var(--border)" }}>
            <div
              className="flex items-center px-4 py-2.5 text-xs font-medium"
              style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
            >
              <span className="flex-1">Task</span>
              <span className="w-24">Priority</span>
              <span className="w-24">Members</span>
              <span className="w-28">Due Date</span>
              <span className="w-14 text-right">Actions</span>
            </div>
            {subtasks.map((s) => (
              <div key={s.id} className="flex items-center px-4 py-3 text-sm border-t" style={{ borderColor: "var(--border)" }}>
                <span className="flex-1" style={{ color: "var(--text)" }}>{s.title}</span>
                <span className="w-24"><PriorityBadge priority={s.priority} /></span>
                <span className="w-24"><Avatar member={s.member} size={24} /></span>
                <span className="w-28" style={{ color: "var(--text)" }}>{s.dueDate}</span>
                <span className="w-14 flex justify-end"><MoreHorizontal size={15} className="opacity-50" /></span>
              </div>
            ))}
            <button className="w-full flex items-center gap-2 px-4 py-3 text-sm border-t hover:bg-black/[0.02]" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              <Plus size={14} /> Add Subtasks
            </button>
          </div>

          <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Subtasks</h2>
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border p-4 mb-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar member={c.author} size={26} />
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{c.author.name}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{c.postedAt}</span>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn small><Smile size={14} /></IconBtn>
                  <IconBtn small><MoreVertical size={14} /></IconBtn>
                </div>
              </div>
              <p className="text-sm" style={{ color: "var(--text)" }}>{c.text}</p>
            </div>
          ))}

          <div className="rounded-xl border p-3 flex items-center gap-2 mb-4" style={{ borderColor: "var(--border)" }}>
            <Avatar member={currentUser} size={26} />
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Leave a reply…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text)" }}
            />
            <Paperclip size={15} className="opacity-50" />
            <Send size={15} className="opacity-50" />
          </div>

          <div className="rounded-xl border p-3 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <input
              placeholder="Add a comment…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text)" }}
            />
            <Paperclip size={15} className="opacity-50" />
            <Send size={15} className="opacity-50" />
          </div>
        </div>

        <aside className="w-[360px] shrink-0 border-l px-6 py-6" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-1.5 font-semibold text-sm" style={{ color: "var(--text)" }}>
              <ChevronDown size={14} /> Details
            </span>
            <div className="flex items-center gap-2">
              <Plus size={15} className="opacity-60" />
              <Settings size={15} className="opacity-60" />
            </div>
          </div>

          <DetailRow label="Status">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "#d97706" }}>
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Backlog
            </span>
          </DetailRow>

          <DetailRow label="Priority">
            <div className="relative">
              <button
                onClick={() => setPriorityOpen((o) => !o)}
                className="flex items-center gap-1 text-sm"
              >
                <PriorityBadge priority={priority} />
                <ChevronDown size={13} className="opacity-50" />
              </button>
              <Dropdown open={priorityOpen} onClose={() => setPriorityOpen(false)} anchorClassName="right-0 top-full mt-2 w-40">
                <div className="px-3 py-1 text-xs" style={{ color: "var(--text-muted)" }}>Priority</div>
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPriority(p); setPriorityOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-black/5"
                  >
                    <PriorityBadge priority={p} />
                    {priority === p && <Check size={13} />}
                  </button>
                ))}
              </Dropdown>
            </div>
          </DetailRow>

          <DetailRow label="Members">
            <button className="text-sm flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <Plus size={13} /> Add members
            </button>
          </DetailRow>

          <DetailRow label="Dates">
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setDateOpen((o) => !o)}
                className="text-sm px-2 py-1 rounded-full border flex items-center gap-1"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                <Calendar size={12} /> Jan 10
              </button>
              <span style={{ color: "var(--text-muted)" }}>→</span>
              <button className="text-sm px-2 py-1 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                End
              </button>
              <Dropdown open={dateOpen} onClose={() => setDateOpen(false)} anchorClassName="left-0 top-full mt-2">
                <MiniCalendar />
              </Dropdown>
            </div>
          </DetailRow>

          <DetailRow label="Labels">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>—</span>
          </DetailRow>
          <DetailRow label="Teams">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>—</span>
          </DetailRow>
          <DetailRow label="Reporter">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>—</span>
          </DetailRow>

          <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="flex items-center gap-1.5 font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>
              <ChevronDown size={14} /> Updates
            </span>
            <div className="flex items-start gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              </span>
              <p className="text-sm" style={{ color: "var(--text)" }}>
                <span className="font-medium">You</span> changed priority from No priority to Urgent
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Avatar member={currentUser} size={28} />
              <div className="text-sm" style={{ color: "var(--text)" }}>
                <span className="font-medium">You</span> posted an update
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Aug 2026</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-6 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
      <span className="w-24 shrink-0 text-sm font-medium pt-1" style={{ color: "var(--text)" }}>{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
      {children}
    </div>
  );
}

function IconBtn({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <button
      className={`rounded-lg border flex items-center justify-center hover:bg-black/5 ${small ? "p-1" : "p-1.5"}`}
      style={{ borderColor: "var(--border)", color: "var(--text)" }}
    >
      {children}
    </button>
  );
}
