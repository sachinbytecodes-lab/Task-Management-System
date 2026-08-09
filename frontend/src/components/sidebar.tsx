"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Briefcase, ChevronDown } from "lucide-react";
import UserMenu from "./user-menu";
import { useState } from "react";

const NAV = [
  { href: "/tasks", label: "Tasks", icon: LayoutGrid },
  { href: "/projects", label: "Projects", icon: Briefcase },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  return (
    <aside
      className="w-[338px] shrink-0 border-r flex flex-col px-4 py-4"
      style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
    >
      <div className="mb-6">
        <UserMenu />
      </div>

      <button
        onClick={() => setWorkspaceOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium mb-2 px-1"
        style={{ color: "var(--text)" }}
      >
        Workspace
        <ChevronDown size={14} className={`opacity-60 transition-transform ${workspaceOpen ? "" : "-rotate-90"}`} />
      </button>

      {workspaceOpen && (
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition"
                style={{
                  background: active ? "var(--bg)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text)",
                  boxShadow: active ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={17} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </aside>
  );
}
