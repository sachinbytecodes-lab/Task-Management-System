"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import TopBar from "@/components/top-bar";
import FilterMenu from "@/components/filter-menu";
import PriorityBadge from "@/components/priority-badge";
import Avatar from "@/components/avatar";
import AddTaskModal from "@/components/add-task-modal";
import { projects as initialProjects } from "@/lib/mock-data";
import { Priority, ProjectItem } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = projects
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !priorityFilter || p.priority === priorityFilter);

  const addProject = (title: string) => {
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
