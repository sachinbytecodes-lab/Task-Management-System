"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import TopBar from "@/components/top-bar";
import FilterMenu from "@/components/filter-menu";
import PriorityBadge from "@/components/priority-badge";
import Avatar from "@/components/avatar";
import AddTaskModal from "@/components/add-task-modal";
import { projects as mockProjects } from "@/lib/mock-data";
import { Priority, ProjectItem } from "@/lib/types";
import { gradientForId } from "@/lib/avatar-gradient";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

function normalize(p: any): ProjectItem {
  return {
    id: p._id ?? p.id,
    name: p.name,
    priority: p.priority,
    lead: p.lead
      ? { id: p.lead._id, name: p.lead.fullName, initials: (p.lead.fullName ?? "?")[0], avatarGradient: gradientForId(p.lead._id) }
      : null,
    dueDate: p.dueDate ?? "—",
  };
}

export default function ProjectsPage() {
  const { apiConnected } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>(mockProjects);
  const [usingApi, setUsingApi] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);
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

  const filtered = projects
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !priorityFilter || p.priority === priorityFilter);

  const addProject = async (title: string) => {
    if (usingApi) {
      try {
        const created = await api.createProject({ name: title });
        setProjects((p) => [...p, normalize(created)]);
        return;
      } catch {
        // fall through to local add
      }
    }
    setProjects((p) => [
      ...p,
      { id: `p-${Date.now()}`, name: title, priority: "No Priority", lead: null, dueDate: "—" },
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
        filterSlot={<FilterMenu priority={priorityFilter} onPriorityChange={setPriorityFilter} />}
        addLabel="Add Project"
        onAdd={() => setModalOpen(true)}
      />

      <div className="px-6 pb-10">
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div
            className="flex items-center px-4 py-3 text-xs font-medium"
            style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
          >
            <span className="flex-1">Projects</span>
            <span className="w-28">Priority</span>
            <span className="w-28">Lead</span>
            <span className="w-32">Due Date</span>
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
              <span className="w-28"><PriorityBadge priority={p.priority} /></span>
              <span className="w-28"><Avatar member={p.lead} size={26} /></span>
              <span className="w-32" style={{ color: "var(--text)" }}>{p.dueDate}</span>
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
      </div>

      {modalOpen && (
        <AddTaskModal status={"To Do"} label="Add project" onClose={() => setModalOpen(false)} onCreate={(title) => addProject(title)} />
      )}
    </div>
  );
}
