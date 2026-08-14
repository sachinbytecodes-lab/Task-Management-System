"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Trash2 } from "lucide-react";
import TopBar from "@/components/top-bar";
import ProjectFieldsMenu, { ProjectFieldKey } from "@/components/project-fields-menu";
import FilterMenu, { FilterState } from "@/components/filter-menu";
import PriorityBadge from "@/components/priority-badge";
import Avatar from "@/components/avatar";
import Dropdown from "@/components/dropdown";
import ProjectFormModal, { NewProjectPayload } from "@/components/project-form-modal";
import { projects as mockProjects } from "@/lib/mock-data";
import { ProjectItem } from "@/lib/types";
import { gradientForId } from "@/lib/avatar-gradient";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const emptyFilters: FilterState = { priority: null, status: null, member: null, label: null, reporter: null, team: null };

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
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [fields, setFields] = useState<Record<ProjectFieldKey, boolean>>({
    status: true,
    priority: true,
    lead: true,
    dueDate: true,
    labels: false,
    teams: false,
    reporter: false,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    return projects
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => !filters.priority || p.priority === filters.priority)
      .filter((p) => !filters.status || p.status === filters.status)
      .filter((p) => !filters.member || p.lead?.id === filters.member || (p.members ?? []).some((m) => m.id === filters.member))
      .filter((p) => !filters.reporter || p.reporter?.id === filters.reporter)
      .filter((p) => !filters.label || (p.labels ?? []).includes(filters.label as string))
      .filter((p) => !filters.team || (p.teams ?? []).includes(filters.team as string));
  }, [projects, search, filters]);

  const isFiltering = search.trim().length > 0 || Object.values(filters).some(Boolean);

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

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project? Its tasks will stay on the Tasks page but will no longer be linked to it.")) return;
    setProjects((p) => p.filter((x) => x.id !== id));
    if (usingApi) {
      try {
        await api.deleteProject(id);
      } catch {
        // already removed optimistically
      }
    }
  };

  return (
    <div>
      <TopBar
        title="Projects"
        searchOpen={searchOpen}
        onToggleSearch={() => setSearchOpen((o) => !o)}
        searchValue={search}
        onSearchChange={setSearch}
        fieldsSlot={<ProjectFieldsMenu fields={fields} onFieldsChange={setFields} />}
        filterSlot={<FilterMenu filters={filters} onFiltersChange={setFilters} items={projects} />}
        addLabel="Add Project"
        onAdd={() => setModalOpen(true)}
      />

      <div className="px-6 pb-10">
        {isFiltering && filtered.length === 0 ? (
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
              {fields.status && <span className="w-24">Status</span>}
              {fields.priority && <span className="w-28">Priority</span>}
              {fields.lead && <span className="w-24">Lead</span>}
              {fields.dueDate && <span className="w-28">Due Date</span>}
              {fields.labels && <span className="w-32">Labels</span>}
              {fields.teams && <span className="w-32">Teams</span>}
              {fields.reporter && <span className="w-28">Reporter</span>}
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
                {fields.status && <span className="w-24 text-xs" style={{ color: "var(--text-muted)" }}>{p.status ?? "—"}</span>}
                {fields.priority && <span className="w-28"><PriorityBadge priority={p.priority} /></span>}
                {fields.lead && <span className="w-24"><Avatar member={p.lead} size={26} /></span>}
                {fields.dueDate && <span className="w-28" style={{ color: "var(--text)" }}>{p.dueDate}</span>}
                {fields.labels && (
                  <span className="w-32 text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {(p.labels ?? []).join(", ") || "—"}
                  </span>
                )}
                {fields.teams && (
                  <span className="w-32 text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {(p.teams ?? []).join(", ") || "—"}
                  </span>
                )}
                {fields.reporter && (
                  <span className="w-28 text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {p.reporter?.name ?? "—"}
                  </span>
                )}
                <span className="w-16 flex justify-end relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === p.id ? null : p.id);
                    }}
                    className="p-1 rounded hover:bg-black/5"
                  >
                    <MoreHorizontal size={16} className="opacity-50" />
                  </button>
                  <Dropdown open={menuOpenId === p.id} onClose={() => setMenuOpenId(null)} anchorClassName="right-0 top-full mt-1 w-44">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpenId(null);
                        deleteProject(p.id);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5"
                      style={{ color: "#dc2626" }}
                    >
                      <Trash2 size={14} /> Delete project
                    </button>
                  </Dropdown>
                </span>
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
