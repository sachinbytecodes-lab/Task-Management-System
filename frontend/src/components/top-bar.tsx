"use client";

import { Search, Columns3, Filter, Plus, PanelLeft } from "lucide-react";
import { ReactNode } from "react";

export default function TopBar({
  title,
  breadcrumb,
  onToggleSidebar,
  searchOpen,
  onToggleSearch,
  searchValue,
  onSearchChange,
  fieldsSlot,
  filterSlot,
  addLabel = "Add Task",
  onAdd,
}: {
  title: string;
  breadcrumb?: ReactNode;
  onToggleSidebar?: () => void;
  searchOpen?: boolean;
  onToggleSearch?: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  fieldsSlot?: ReactNode;
  filterSlot?: ReactNode;
  addLabel?: string;
  onAdd?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <button onClick={onToggleSidebar} className="p-1 rounded hover:bg-black/5">
          <PanelLeft size={18} style={{ color: "var(--text)" }} />
        </button>
        <div className="w-px h-4" style={{ background: "var(--border)" }} />
        {breadcrumb}
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{title}</h1>

        <div className="flex items-center gap-2">
          {searchOpen ? (
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
          )}

          {fieldsSlot}
          {filterSlot}

          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white text-sm font-medium px-3.5 py-2 hover:opacity-90 transition"
          >
            <Plus size={16} />
            {addLabel}
          </button>
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
