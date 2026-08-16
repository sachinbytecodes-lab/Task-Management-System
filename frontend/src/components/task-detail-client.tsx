"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Lock, Eye, Share2, MoreHorizontal, PanelRight, ChevronDown, Plus, Settings,
  Paperclip, Send, Smile, MoreVertical, Calendar, Check, X, Trash2, LockOpen,
} from "lucide-react";
import TopBar from "@/components/top-bar";
import Avatar from "./avatar";
import PriorityBadge from "@/components/priority-badge";
import Dropdown from "@/components/dropdown";
import SubtaskFormModal from "@/components/subtask-form-modal";
import { gradientForId } from "@/lib/avatar-gradient";
import { taskDetail as mockTaskDetail, subtasks as mockSubtasks, comments as mockComments, currentUser } from "@/lib/mock-data";
import { Priority, Status } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const PRIORITIES: Priority[] = ["No Priority", "Urgent", "High", "Medium", "Low"];
const STATUSES: Status[] = ["To Do", "Doing", "Completed", "On Hold"];
const STATUS_COLOR: Record<string, string> = { "To Do": "#737373", Doing: "#2563eb", Completed: "#16a34a", "On Hold": "#dc2626" };

const DETAIL_FIELD_KEYS = ["status", "priority", "members", "dates", "labels", "teams", "reporter"] as const;
type DetailFieldKey = (typeof DETAIL_FIELD_KEYS)[number];
const DETAIL_FIELD_LABELS: Record<DetailFieldKey, string> = {
  status: "Status", priority: "Priority", members: "Members", dates: "Dates",
  labels: "Labels", teams: "Teams", reporter: "Reporter",
};
const DETAIL_FIELDS_KEY = "pyramid-task-detail-fields";

function toMember(m: any) {
  if (!m) return null;
  return {
    id: m._id ?? m.id ?? "unknown",
    name: m.fullName ?? m.name ?? m.email ?? "Unknown",
    initials: (m.fullName ?? m.name ?? m.email ?? "?")[0],
    avatarGradient: gradientForId(m._id ?? m.id),
  };
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TaskDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { apiConnected, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [task, setTask] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [subtaskModalOpen, setSubtaskModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Dropdown open-state, one per editable field
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [reporterOpen, setReporterOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [fieldsSettingsOpen, setFieldsSettingsOpen] = useState(false);

  // UI-only chrome: right panel visibility, details section collapse, share feedback
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(true);
  const [detailsSectionOpen, setDetailsSectionOpen] = useState(true);
  const [updatesSectionOpen, setUpdatesSectionOpen] = useState(true);
  const [subtasksSectionOpen, setSubtasksSectionOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [visibleFields, setVisibleFields] = useState<Record<DetailFieldKey, boolean>>({
    status: true, priority: true, members: true, dates: true, labels: true, teams: true, reporter: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(DETAIL_FIELDS_KEY);
    if (stored) {
      try { setVisibleFields(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const toggleVisibleField = (key: DetailFieldKey) => {
    setVisibleFields((v) => {
      const next = { ...v, [key]: !v[key] };
      localStorage.setItem(DETAIL_FIELDS_KEY, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);

      if (apiConnected) {
        try {
          const t = await api.getTask(params.id);
          if (!cancelled) {
            setTask(t);
            setLoading(false);
          }
          return;
        } catch {
          // Real API is up but this id doesn't exist there (e.g. it's a mock id) — fall through
        }
      }

      if (!cancelled) {
        if (params.id === mockTaskDetail.id || !apiConnected) {
          setTask(null); // signals "use mock" in render
          setLoading(false);
        } else {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, apiConnected]);

  const isMock = !task;
  const locked = isMock ? false : !!task.locked;
  const canEdit = !isMock && apiConnected && !locked;

  const title = isMock ? mockTaskDetail.title : task.title;
  const description = isMock ? mockTaskDetail.description : task.description || "No description yet.";
  const labels: string[] = isMock ? mockTaskDetail.labels : task.labels ?? [];
  const teams: string[] = isMock ? [] : task.teams ?? [];
  const status: string = isMock ? mockTaskDetail.status : task.status;
  const priority: Priority = isMock ? mockTaskDetail.priority : task.priority;
  const dueDate = isMock ? mockTaskDetail.dueDate : task.dueDate ?? "";
  const member = isMock ? null : toMember(task.member);
  const reporter = isMock ? null : toMember(task.reporter);
  const watchers: any[] = isMock ? [] : task.watchers ?? [];
  const watcherIds = watchers.map((w: any) => (typeof w === "string" ? w : w._id));
  const isWatching = !!user && watcherIds.includes(user.id);
  const updates: any[] = isMock ? [] : task.updates ?? [];
  const resources: any[] = isMock ? [] : task.resources ?? [];

  const subtaskList = isMock ? mockSubtasks : (task.subtasks ?? []).map((s: any) => ({
    id: s._id, title: s.title, priority: s.priority, member: toMember(s.member), dueDate: s.dueDate ?? "—",
  }));
  const commentList = isMock ? mockComments : (task.comments ?? []).map((c: any) => ({
    id: c._id,
    author: toMember(c.author) ?? currentUser,
    text: c.text,
    postedAt: c.createdAt ? new Date(c.createdAt).toLocaleString() : "just now",
  }));

  const ensureUsersLoaded = () => {
    if (users.length === 0) {
      api.getUsers().then(setUsers).catch(() => {});
    }
  };

  const patchTask = async (partial: Record<string, unknown>) => {
    if (!canEdit) {
      if (locked) alert("This task is locked — unlock it first to make changes.");
      return;
    }
    const prev = task;
    setTask((t: any) => ({ ...t, ...partial }));
    try {
      const updated = await api.updateTask(task._id, partial);
      setTask(updated);
    } catch (err) {
      setTask(prev); // revert on failure
      alert(err instanceof Error ? err.message : "Couldn't save that change — please try again.");
    }
  };

  // Bypasses the "locked blocks edits" gate — used only for the lock toggle
  // itself and for watch/unwatch, both of which must still work on a locked
  // task (the backend already exempts these two fields from its lock check).
  const rawPatchTask = async (partial: Record<string, unknown>) => {
    if (isMock) {
      alert("This is demo data (no backend connected), so it can't be saved.");
      return;
    }
    if (!apiConnected) {
      alert("Not connected to the server right now — this change wasn't saved.");
      return;
    }
    const prev = task;
    setTask((t: any) => ({ ...t, ...partial }));
    try {
      const updated = await api.updateTask(task._id, partial);
      setTask(updated);
    } catch (err) {
      setTask(prev);
      alert(err instanceof Error ? err.message : "Couldn't save that change — please try again.");
    }
  };

  const toggleLock = () => {
    rawPatchTask({ locked: !task.locked });
  };

  const toggleWatch = () => {
    if (!user) return;
    const next = isWatching ? watcherIds.filter((id: string) => id !== user.id) : [...watcherIds, user.id];
    rawPatchTask({ watchers: next });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — silently ignore
    }
  };

  const deleteTask = async () => {
    if (isMock || !apiConnected) {
      router.push("/tasks");
      return;
    }
    if (!confirm("Delete this task? This can't be undone.")) return;
    try {
      await api.deleteTask(task._id);
    } catch {
      // proceed to navigate regardless
    }
    router.push("/tasks");
  };

  const submitComment = async () => {
    if (!reply.trim()) return;
    if (isMock || !apiConnected || locked) {
      setReply("");
      return;
    }
    setSubmittingComment(true);
    try {
      const updated = await api.addComment(task._id, reply.trim());
      setTask(updated);
      setReply("");
    } finally {
      setSubmittingComment(false);
    }
  };

  const removeResource = async (resourceId: string) => {
    if (isMock || !apiConnected) return;
    if (!canEdit) {
      alert("This task is locked — unlock it first to make changes.");
      return;
    }
    try {
      const updated = await api.removeResource(task._id, resourceId);
      setTask(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't remove that resource.");
    }
  };

  if (loading) {
    return <div className="p-8 text-sm" style={{ color: "var(--text-muted)" }}>Loading task…</div>;
  }

  if (notFound) {
    return (
      <div className="p-8">
        <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>This task couldn&apos;t be found.</p>
        <Link href="/tasks" className="text-sm underline" style={{ color: "var(--text)" }}>Back to Tasks</Link>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title=""
        breadcrumb={
          <div className="text-sm flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Link href="/tasks" className="hover:underline">Tasks</Link>
          </div>
        }
        showSearch={false}
        showAdd={false}
      />

      {isMock && apiConnected === false && (
        <div className="mx-6 mt-4 rounded-lg px-3 py-2 text-xs" style={{ background: "#fef3c7", color: "#92400e" }}>
          Showing demo data — the API isn&apos;t reachable right now, so edits here won&apos;t be saved.
        </div>
      )}
      {locked && (
        <div className="mx-6 mt-4 rounded-lg px-3 py-2 text-xs flex items-center gap-1.5" style={{ background: "#fee2e2", color: "#991b1b" }}>
          <Lock size={12} /> This task is locked — unlock it (top-right) to make changes.
        </div>
      )}

      <div className="flex">
        <div className={`flex-1 min-w-0 px-8 py-6 ${detailsPanelOpen ? "max-w-3xl" : ""}`}>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{title}</h1>
            <div className="flex items-center gap-2 shrink-0">
              <IconBtn onClick={toggleLock} active={locked} title={locked ? "Unlock task" : "Lock task (prevent edits)"}>
                {locked ? <Lock size={15} /> : <LockOpen size={15} />}
              </IconBtn>
              <IconBtn onClick={toggleWatch} active={isWatching} title={isWatching ? "You're watching this task — click to stop watching. Watchers appear in the Updates log for every change." : "Watch this task to keep it on your radar (click to start)"}>
                <Eye size={15} />
                <span className="text-xs ml-1">{isWatching ? "Watching" : watchers.length > 0 ? watchers.length : "Watch"}</span>
              </IconBtn>
              <IconBtn onClick={copyLink} active={copied} title="Copy link to this task">
                {copied ? <Check size={15} /> : <Share2 size={15} />}
              </IconBtn>
              <div className="relative">
                <IconBtn onClick={() => setTopMenuOpen((o) => !o)} title="More actions">
                  <MoreHorizontal size={15} />
                </IconBtn>
                <Dropdown open={topMenuOpen} onClose={() => setTopMenuOpen(false)} anchorClassName="right-0 top-full mt-1 w-40">
                  <button
                    onClick={() => { setTopMenuOpen(false); deleteTask(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5"
                    style={{ color: "#dc2626" }}
                  >
                    <Trash2 size={14} /> Delete task
                  </button>
                </Dropdown>
              </div>
              <IconBtn onClick={() => setDetailsPanelOpen((o) => !o)} active={!detailsPanelOpen} title={detailsPanelOpen ? "Hide details panel" : "Show details panel"}>
                <PanelRight size={15} />
              </IconBtn>
            </div>
          </div>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>{description}</p>

          <Field label="Properties">
            {teams.length > 0 && teams.map((t: string) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full border"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                {t}
              </span>
            ))}
            <span
              className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full"
              style={{ background: "#fee2e2", color: "#dc2626" }}
            >
              <Calendar size={12} /> {dueDate ? formatDate(dueDate) || dueDate : "No due date"}
            </span>
          </Field>

          <Field label="Labels">
            {labels.length === 0 && <span className="text-sm" style={{ color: "var(--text-muted)" }}>No labels</span>}
            {labels.map((l: string) => (
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
            {resources.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-1 w-full">
                {resources.map((r: any) => (
                  <span
                    key={r._id}
                    className="inline-flex items-center gap-1.5 text-sm pl-2.5 pr-1.5 py-1 rounded-full border"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      <Paperclip size={12} /> {r.title}
                    </a>
                    <button
                      onClick={() => removeResource(r._id)}
                      disabled={!canEdit}
                      className="p-0.5 rounded hover:bg-black/10 disabled:opacity-40"
                      title="Remove"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <button
                onClick={() => setResourceOpen((o) => !o)}
                disabled={!canEdit}
                className="text-sm flex items-center gap-1.5 disabled:opacity-50"
                style={{ color: "var(--text-muted)" }}
              >
                <Paperclip size={14} /> Add document or link…
              </button>
              <Dropdown open={resourceOpen} onClose={() => setResourceOpen(false)} anchorClassName="left-0 top-full mt-2">
                <ResourceEditor
                  onSave={async (title, url) => {
                    if (isMock || !apiConnected) {
                      alert(isMock ? "This is demo data — resources can't be saved here." : "Not connected to the server right now.");
                      return;
                    }
                    try {
                      const updated = await api.addResource(task._id, { title, url });
                      setTask(updated);
                      setResourceOpen(false);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Couldn't add that resource.");
                    }
                  }}
                />
              </Dropdown>
            </div>
          </Field>

          <div className="flex items-center gap-1.5 mt-6 mb-2">
            <button onClick={() => setSubtasksSectionOpen((o) => !o)} className="flex items-center gap-1.5">
              <ChevronDown size={14} className={`transition-transform ${subtasksSectionOpen ? "" : "-rotate-90"}`} />
              <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Subtasks</h2>
            </button>
          </div>
          {subtasksSectionOpen && (
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
            {subtaskList.length === 0 && (
              <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>No subtasks yet.</div>
            )}
            {subtaskList.map((s: any) => (
              <div key={s.id} className="flex items-center px-4 py-3 text-sm border-t" style={{ borderColor: "var(--border)" }}>
                <span className="flex-1" style={{ color: "var(--text)" }}>{s.title}</span>
                <span className="w-24"><PriorityBadge priority={s.priority} /></span>
                <span className="w-24"><Avatar member={s.member} size={24} /></span>
                <span className="w-28" style={{ color: "var(--text)" }}>{s.dueDate}</span>
                <span className="w-14 flex justify-end"><MoreHorizontal size={15} className="opacity-50" /></span>
              </div>
            ))}
            <button
              onClick={() => {
                if (isMock || !apiConnected || locked) return;
                setSubtaskModalOpen(true);
              }}
              disabled={isMock || !apiConnected || locked}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm border-t hover:bg-black/[0.02] disabled:opacity-50"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <Plus size={14} /> Add Subtasks
            </button>
          </div>
          )}

          <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Comments</h2>
          {commentList.length === 0 && (
            <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>No comments yet — be the first to leave one.</p>
          )}
          {commentList.map((c: any) => (
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

          <div className="rounded-xl border p-3 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <Avatar member={currentUser} size={26} />
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder={isMock || !apiConnected ? "Comments are read-only in demo mode…" : locked ? "Task is locked…" : "Add a comment…"}
              disabled={isMock || !apiConnected || submittingComment || locked}
              className="flex-1 bg-transparent outline-none text-sm disabled:opacity-50"
              style={{ color: "var(--text)" }}
            />
            <Paperclip size={15} className="opacity-50" />
            <button onClick={submitComment} disabled={isMock || !apiConnected || locked}>
              <Send size={15} className="opacity-50" />
            </button>
          </div>
        </div>

        {detailsPanelOpen && (
          <aside className="w-[360px] shrink-0 border-l px-6 py-6" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setDetailsSectionOpen((o) => !o)}
                className="flex items-center gap-1.5 font-semibold text-sm"
                style={{ color: "var(--text)" }}
              >
                <ChevronDown size={14} className={`transition-transform ${detailsSectionOpen ? "" : "-rotate-90"}`} />
                Details
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { if (!isMock && apiConnected && !locked) setSubtaskModalOpen(true); }}
                  title="Quick-add a subtask"
                  className="p-0.5 rounded hover:bg-black/5 disabled:opacity-40"
                  disabled={isMock || !apiConnected || locked}
                >
                  <Plus size={15} className="opacity-60" />
                </button>
                <div className="relative">
                  <button onClick={() => setFieldsSettingsOpen((o) => !o)} title="Choose visible fields" className="p-0.5 rounded hover:bg-black/5">
                    <Settings size={15} className="opacity-60" />
                  </button>
                  <Dropdown open={fieldsSettingsOpen} onClose={() => setFieldsSettingsOpen(false)} anchorClassName="right-0 top-full mt-1 w-48">
                    <div className="px-3 py-1.5 text-xs" style={{ color: "var(--text-muted)" }}>Show in Details</div>
                    {DETAIL_FIELD_KEYS.map((k) => (
                      <label key={k} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer hover:bg-black/5" style={{ color: "var(--text)" }}>
                        <span className="flex-1">{DETAIL_FIELD_LABELS[k]}</span>
                        <span
                          onClick={(e) => { e.preventDefault(); toggleVisibleField(k); }}
                          className="w-4 h-4 rounded flex items-center justify-center border"
                          style={{ borderColor: visibleFields[k] ? "var(--accent)" : "var(--border)", background: visibleFields[k] ? "var(--accent)" : "transparent" }}
                        >
                          {visibleFields[k] && <Check size={11} color="var(--accent-fg)" />}
                        </span>
                      </label>
                    ))}
                  </Dropdown>
                </div>
              </div>
            </div>

            {detailsSectionOpen && (
              <>
                {visibleFields.status && (
                  <DetailRow label="Status">
                    <div className="relative">
                      <button onClick={() => setStatusOpen((o) => !o)} disabled={!canEdit} className="flex items-center gap-1 text-sm disabled:opacity-70">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: STATUS_COLOR[status] }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[status] }} /> {status}
                        </span>
                        <ChevronDown size={13} className="opacity-50" />
                      </button>
                      <Dropdown open={statusOpen} onClose={() => setStatusOpen(false)} anchorClassName="right-0 top-full mt-2 w-40">
                        <div className="px-3 py-1 text-xs" style={{ color: "var(--text-muted)" }}>Status</div>
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => { patchTask({ status: s }); setStatusOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-black/5"
                          >
                            <span className="inline-flex items-center gap-2" style={{ color: "var(--text)" }}>
                              <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[s] }} /> {s}
                            </span>
                            {status === s && <Check size={13} />}
                          </button>
                        ))}
                      </Dropdown>
                    </div>
                  </DetailRow>
                )}

                {visibleFields.priority && (
                  <DetailRow label="Priority">
                    <div className="relative">
                      <button onClick={() => setPriorityOpen((o) => !o)} disabled={!canEdit} className="flex items-center gap-1 text-sm disabled:opacity-70">
                        <PriorityBadge priority={priority} />
                        <ChevronDown size={13} className="opacity-50" />
                      </button>
                      <Dropdown open={priorityOpen} onClose={() => setPriorityOpen(false)} anchorClassName="right-0 top-full mt-2 w-40">
                        <div className="px-3 py-1 text-xs" style={{ color: "var(--text-muted)" }}>Priority</div>
                        {PRIORITIES.map((p) => (
                          <button
                            key={p}
                            onClick={() => { patchTask({ priority: p }); setPriorityOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-black/5"
                          >
                            <PriorityBadge priority={p} />
                            {priority === p && <Check size={13} />}
                          </button>
                        ))}
                      </Dropdown>
                    </div>
                  </DetailRow>
                )}

                {visibleFields.members && (
                  <DetailRow label="Members">
                    <div className="relative">
                      <button
                        onClick={() => { ensureUsersLoaded(); setMembersOpen((o) => !o); }}
                        disabled={!canEdit}
                        className="flex items-center gap-1.5 text-sm disabled:opacity-70"
                        style={{ color: member ? "var(--text)" : "var(--text-muted)" }}
                      >
                        {member ? <Avatar member={member} size={20} /> : <Plus size={13} />}
                        {member ? member.name : "Add members"}
                      </button>
                      <Dropdown open={membersOpen} onClose={() => setMembersOpen(false)} anchorClassName="right-0 top-full mt-2 w-56">
                        <UserPicker users={users} currentId={member?.id} onSelect={(id) => { patchTask({ member: id }); setMembersOpen(false); }} />
                      </Dropdown>
                    </div>
                  </DetailRow>
                )}

                {visibleFields.dates && (
                  <DetailRow label="Dates">
                    <div className="relative">
                      <button
                        onClick={() => setDatesOpen((o) => !o)}
                        disabled={!canEdit}
                        className="text-sm px-2 py-1 rounded-full border flex items-center gap-1 disabled:opacity-70"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        <Calendar size={12} /> {dueDate ? (formatDate(dueDate) || dueDate) : "Set date"}
                      </button>
                      <Dropdown open={datesOpen} onClose={() => setDatesOpen(false)} anchorClassName="right-0 top-full mt-2">
                        <DateEditor
                          initial={dueDate}
                          onSave={(v) => { patchTask({ dueDate: v ? formatDate(v) : "" }); setDatesOpen(false); }}
                        />
                      </Dropdown>
                    </div>
                  </DetailRow>
                )}

                {visibleFields.labels && (
                  <DetailRow label="Labels">
                    <div className="relative">
                      <button onClick={() => setLabelsOpen((o) => !o)} disabled={!canEdit} className="text-sm disabled:opacity-70" style={{ color: labels.length ? "var(--text)" : "var(--text-muted)" }}>
                        {labels.length ? labels.join(", ") : "Add labels"}
                      </button>
                      <Dropdown open={labelsOpen} onClose={() => setLabelsOpen(false)} anchorClassName="right-0 top-full mt-2">
                        <TagEditor initial={labels} onSave={(v) => { patchTask({ labels: v }); setLabelsOpen(false); }} />
                      </Dropdown>
                    </div>
                  </DetailRow>
                )}

                {visibleFields.teams && (
                  <DetailRow label="Teams">
                    <div className="relative">
                      <button onClick={() => setTeamsOpen((o) => !o)} disabled={!canEdit} className="text-sm disabled:opacity-70" style={{ color: teams.length ? "var(--text)" : "var(--text-muted)" }}>
                        {teams.length ? teams.join(", ") : "Add teams"}
                      </button>
                      <Dropdown open={teamsOpen} onClose={() => setTeamsOpen(false)} anchorClassName="right-0 top-full mt-2">
                        <TagEditor initial={teams} onSave={(v) => { patchTask({ teams: v }); setTeamsOpen(false); }} />
                      </Dropdown>
                    </div>
                  </DetailRow>
                )}

                {visibleFields.reporter && (
                  <DetailRow label="Reporter">
                    <div className="relative">
                      <button
                        onClick={() => { ensureUsersLoaded(); setReporterOpen((o) => !o); }}
                        disabled={!canEdit}
                        className="flex items-center gap-1.5 text-sm disabled:opacity-70"
                        style={{ color: reporter ? "var(--text)" : "var(--text-muted)" }}
                      >
                        {reporter ? <Avatar member={reporter} size={20} /> : <Plus size={13} />}
                        {reporter ? reporter.name : "Add reporter"}
                      </button>
                      <Dropdown open={reporterOpen} onClose={() => setReporterOpen(false)} anchorClassName="right-0 top-full mt-2 w-56">
                        <UserPicker users={users} currentId={reporter?.id} onSelect={(id) => { patchTask({ reporter: id }); setReporterOpen(false); }} />
                      </Dropdown>
                    </div>
                  </DetailRow>
                )}
              </>
            )}

            <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setUpdatesSectionOpen((o) => !o)}
                className="flex items-center gap-1.5 font-semibold text-sm mb-3"
                style={{ color: "var(--text)" }}
              >
                <ChevronDown size={14} className={`transition-transform ${updatesSectionOpen ? "" : "-rotate-90"}`} /> Updates
              </button>
              {updatesSectionOpen && (
                <>
                  {updates.length === 0 && (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No updates yet — changes to this task will show up here.</p>
                  )}
                  {[...updates].reverse().map((u: any, i: number) => {
                    const uMember = toMember(u.user);
                    const isYou = user && (u.user?._id === user.id || u.user === user.id);
                    return (
                      <div key={u._id ?? i} className="flex items-start gap-2 mb-3">
                        <Avatar member={uMember} size={26} />
                        <div className="text-sm" style={{ color: "var(--text)" }}>
                          <span className="font-medium">{isYou ? "You" : uMember?.name ?? "Someone"}</span> {u.message}
                          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </aside>
        )}
      </div>

      {subtaskModalOpen && (
        <SubtaskFormModal
          onClose={() => setSubtaskModalOpen(false)}
          onCreate={async (payload) => {
            const updated = await api.addSubtask(task._id, payload);
            setTask(updated);
          }}
        />
      )}
    </div>
  );
}

function UserPicker({ users, currentId, onSelect }: { users: any[]; currentId?: string; onSelect: (id: string) => void }) {
  return (
    <div className="w-56 py-1.5">
      <button onClick={() => onSelect("")} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5" style={{ color: "var(--text-muted)" }}>
        Unassign
      </button>
      {users.map((u: any) => (
        <button key={u._id} onClick={() => onSelect(u._id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5">
          <Avatar member={toMember(u)} size={20} />
          <span className="flex-1 text-left truncate" style={{ color: "var(--text)" }}>{u.fullName || u.email}</span>
          {u._id === currentId && <Check size={13} />}
        </button>
      ))}
      {users.length === 0 && <div className="px-3 py-2 text-xs" style={{ color: "var(--text-muted)" }}>Loading users…</div>}
    </div>
  );
}

function TagEditor({ initial, onSave }: { initial: string[]; onSave: (v: string[]) => void }) {
  const [tags, setTags] = useState<string[]>(initial);
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setInput("");
  };

  return (
    <div className="p-3 w-64">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
            {t}
            <button onClick={() => setTags(tags.filter((x) => x !== t))}><X size={10} /></button>
          </span>
        ))}
        {tags.length === 0 && <span className="text-xs" style={{ color: "var(--text-muted)" }}>None yet</span>}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder="Type and press Enter"
        className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none"
        style={{ borderColor: "var(--border)", color: "var(--text)" }}
      />
      <button onClick={() => onSave(tags)} className="w-full mt-2 rounded-lg text-xs font-medium py-1.5" style={{ background: "var(--accent)", color: "var(--accent-fg)" }}>
        Save
      </button>
    </div>
  );
}

function DateEditor({ initial, onSave }: { initial?: string; onSave: (v: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="p-3 w-56">
      <input
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none"
        style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg)" }}
      />
      <div className="flex gap-2 mt-2">
        <button onClick={() => onSave("")} className="flex-1 rounded-lg text-xs py-1.5 border" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
          Clear
        </button>
        <button onClick={() => onSave(value)} className="flex-1 rounded-lg text-xs font-medium py-1.5" style={{ background: "var(--accent)", color: "var(--accent-fg)" }}>
          Save
        </button>
      </div>
    </div>
  );
}

function ResourceEditor({ onSave }: { onSave: (title: string, url: string) => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const submit = () => {
    if (!title.trim() || !url.trim()) return;
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`;
    onSave(title.trim(), normalizedUrl);
  };

  return (
    <div className="p-3 w-72">
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Title</label>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Design spec"
        className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none mb-2"
        style={{ borderColor: "var(--border)", color: "var(--text)" }}
      />
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Link</label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
        placeholder="docs.google.com/… or any URL"
        className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none"
        style={{ borderColor: "var(--border)", color: "var(--text)" }}
      />
      <button
        onClick={submit}
        disabled={!title.trim() || !url.trim()}
        className="w-full mt-2 rounded-lg text-xs font-medium py-1.5 disabled:opacity-50"
        style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
      >
        Add resource
      </button>
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

function IconBtn({ children, small, onClick, active, title }: { children: React.ReactNode; small?: boolean; onClick?: () => void; active?: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-lg border flex items-center justify-center hover:bg-black/5 ${small ? "p-1" : "p-1.5"}`}
      style={{
        borderColor: active ? "var(--accent)" : "var(--border)",
        color: active ? "var(--accent)" : "var(--text)",
        background: active ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
      }}
    >
      {children}
    </button>
  );
}
