"use client";

import { Search, Columns3, Filter, Plus, PanelLeft } from "lucide-react";
import { ReactNode } from "react";
import { useSidebar } from "@/context/sidebar-context";

export default function TopBar({
  title,
  breadcrumb,
  searchOpen,
  onToggleSearch,
  searchValue,
  onSearchChange,
  fieldsSlot,
  filterSlot,
  addLabel = "Add Task",
  onAdd,
  showSearch = true,
  showAdd = true,
  rightSlot,
}: {
  title: string;
  breadcrumb?: ReactNode;
  searchOpen?: boolean;
  onToggleSearch?: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  fieldsSlot?: ReactNode;
  filterSlot?: ReactNode;
  addLabel?: string;
  onAdd?: () => void;
  showSearch?: boolean;
  showAdd?: boolean;
  rightSlot?: ReactNode;
}) {
  const { collapsed, toggle } = useSidebar();

  return (
    <div>
      <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <button onClick={toggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="p-1 rounded hover:bg-black/5">
          <PanelLeft size={18} style={{ color: "var(--text)" }} />
        </button>
        <div className="w-px h-4" style={{ background: "var(--border)" }} />
        {breadcrumb}
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        {title && <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{title}</h1>}

        <div className="flex items-center gap-2 ml-auto">
          {showSearch && (searchOpen ? (
            <div
              className="flex items-center gap-2 border rounded-lg px-3 py-2 w-64"
              style={{ borderColor: "var(--border)" }}
            >
              <Search size={16} className="opacity-50" />
              <input
                autoFocus
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={`${title.slice(0, -1) || title}`}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--text)" }}
              />
              <kbd className="text-xs opacity-40">⌘F</kbd>
            </div>
          ) : (
            <IconButton onClick={onToggleSearch}>
              <Search size={17} />
            </IconButton>
          ))}

          {fieldsSlot}
          {filterSlot}

          {showAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 rounded-lg text-sm font-medium px-3.5 py-2 hover:opacity-90 transition"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              <Plus size={16} />
              {addLabel}
            </button>
          )}

          {rightSlot}
        </div>
      </div>
    </div>
  );
}

export function IconButton({ children, onClick, active }: { children: ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="p-2.5 rounded-lg border transition hover:bg-black/5"
      style={{ borderColor: "var(--border)", background: active ? "var(--bg-subtle)" : "transparent", color: "var(--text)" }}
    >
      {children}
    </button>
  );
}
