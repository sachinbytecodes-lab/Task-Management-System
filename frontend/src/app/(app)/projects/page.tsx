"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import TopBar from "@/components/top-bar";
import PriorityBadge from "@/components/priority-badge";
import Avatar from "@/components/avatar";
import ProjectFormModal, { NewProjectPayload } from "@/components/project-form-modal";
import { projects as mockProjects } from "@/lib/mock-data";
import { ProjectItem } from "@/lib/types";
import { gradientForId } from "@/lib/avatar-gradient";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

function toMember(m: any) {
  if (!m) return null;
  return { id: m._id, name: m.fullName || m.email, initials: (m.fullName || m.email || "?")[0], avatarGradient: gradientForId(m._id) };
}

function normalize(p: any): ProjectItem {
  return {
    id: p._id ?? p.id,
    name: p.name,
    status: p.status,
    priority: p.priority,
    lead: toMember(p.lead),
    members: (p.members ?? []).map(toMember).filter(Boolean),
    reporter: toMember(p.reporter),
    teams: p.teams ?? [],
    labels: p.labels ?? [],
    dueDate: p.dueDate ?? "—",
  };
}

export default function ProjectsPage() {
  const { apiConnected } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>(mockProjects);
  const [usingApi, setUsingApi] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!apiConnected) return;
    api
      .getProjects()
      .then((data) => {
        setProjects(data.map(normalize));
        setUsingApi(true);
      })
      .catch(() => setUsingApi(false));
  }, [apiConnected]);

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const isSearching = search.trim().length > 0;

  const addProject = async (payload: NewProjectPayload) => {
    if (usingApi) {
      try {
        const created = await api.createProject(payload);
        setProjects((p) => [...p, normalize(created)]);
        return;
      } catch {
        // fall through to local add
      }
    }
    setProjects((p) => [
      ...p,
      {
        id: `p-${Date.now()}`,
        name: payload.name,
        status: payload.status as ProjectItem["status"],
        priority: payload.priority as ProjectItem["priority"],
        lead: null,
        members: [],
        dueDate: payload.dueDate ?? "—",
        teams: payload.teams,
        labels: payload.labels,
      },
    ]);
  };

  return (
    <div>
      <TopBar
        title="Projects"
        onToggleSidebar={() => {}}
        searchOpen={searchOpen}
        onToggleSearch={() => setSearchOpen((o) => !o)}
        searchValue={search}
        onSearchChange={setSearch}
        addLabel="Add Project"
        onAdd={() => setModalOpen(true)}
      />

      <div className="px-6 pb-10">
        {isSearching && filtered.length === 0 ? (
          <div className="py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Match not found.
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div
              className="flex items-center px-4 py-3 text-xs font-medium"
              style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
            >
              <span className="flex-1">Projects</span>
              <span className="w-24">Status</span>
              <span className="w-28">Priority</span>
              <span className="w-24">Lead</span>
              <span className="w-28">Due Date</span>
              <span className="w-16 text-right">Actions</span>
            </div>
            {filtered.length === 0 && (
              <div className="px-4 py-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>
                No projects yet — click &quot;Add Project&quot; to create one.
              </div>
            )}
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center px-4 py-3.5 border-t text-sm hover:bg-black/[0.02]"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="flex-1 font-medium" style={{ color: "var(--text)" }}>{p.name}</span>
                <span className="w-24 text-xs" style={{ color: "var(--text-muted)" }}>{p.status ?? "—"}</span>
                <span className="w-28"><PriorityBadge priority={p.priority} /></span>
                <span className="w-24"><Avatar member={p.lead} size={26} /></span>
                <span className="w-28" style={{ color: "var(--text)" }}>{p.dueDate}</span>
                <span className="w-16 flex justify-end"><MoreHorizontal size={16} className="opacity-50" /></span>
              </Link>
            ))}
            <button
              onClick={() => setModalOpen(true)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm border-t hover:bg-black/[0.02]"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              + Add Projects
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <ProjectFormModal onClose={() => setModalOpen(false)} onCreate={addProject} />
      )}
    </div>
  );
}
