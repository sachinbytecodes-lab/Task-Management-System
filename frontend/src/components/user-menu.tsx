"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronsUpDown, Sun, Square, Settings, Moon, Check, ChevronRight } from "lucide-react";
import Dropdown from "./dropdown";
import { useTheme, ACCENT_SWATCH, ColorMode } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";

const COLOR_LABELS: { key: ColorMode; label: string }[] = [
  { key: "amber", label: "Amber" },
  { key: "blue", label: "Blue" },
  { key: "pink", label: "Pink" },
  { key: "rose", label: "Rose" },
  { key: "emerald", label: "Emerald" },
  { key: "black", label: "Black" },
];

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<"none" | "theme" | "color">("none");
  const { mode, color, setMode, setColor } = useTheme();
  const { user } = useAuth();

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          setSub("none");
        }}
        className="w-full flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-black/5 transition"
      >
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${user?.avatarGradient ?? "from-fuchsia-500 via-purple-500 to-indigo-600"} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
          {(user?.name ?? "D")[0]}
        </div>
        <span className="font-medium text-sm flex-1 text-left truncate" style={{ color: "var(--text)" }}>
          {user?.name ?? "Dexter"}
        </span>
        <ChevronsUpDown size={15} className="opacity-50" />
      </button>

      <Dropdown open={open} onClose={() => setOpen(false)} anchorClassName="left-0 top-full mt-2 w-72">
        <div className="flex flex-col items-center px-4 pt-4 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${user?.avatarGradient ?? "from-fuchsia-500 via-purple-500 to-indigo-600"} flex items-center justify-center text-white text-xl font-semibold mb-2`}>
            {(user?.name ?? "D")[0]}
          </div>
          <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>{user?.name ?? "Dexter"}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>{user?.email ?? "dexter@gmail.com"}</div>
        </div>

        <div className="py-1 relative">
          <MenuRow
            icon={<Sun size={16} />}
            label="Change Theme"
            trailing={<ChevronRight size={14} className="opacity-50" />}
            onClick={() => setSub(sub === "theme" ? "none" : "theme")}
            active={sub === "theme"}
          />
          {sub === "theme" && (
            <div
              className="absolute left-full top-0 ml-1 w-40 rounded-xl border shadow-lg py-1.5"
              style={{ background: "var(--bg)", borderColor: "var(--border)" }}
            >
              <div className="px-3 py-1 text-xs" style={{ color: "var(--text-muted)" }}>Theme</div>
              <SubOption
                icon={<Sun size={15} />}
                label="Light"
                checked={mode === "light"}
                onClick={() => setMode("light")}
              />
              <SubOption
                icon={<Moon size={15} />}
                label="Dark"
                checked={mode === "dark"}
                onClick={() => setMode("dark")}
              />
            </div>
          )}

          <MenuRow
            icon={<Square size={16} fill={ACCENT_SWATCH[color]} color={ACCENT_SWATCH[color]} />}
            label="Color Mode"
            trailing={<ChevronRight size={14} className="opacity-50" />}
            onClick={() => setSub(sub === "color" ? "none" : "color")}
            active={sub === "color"}
          />
          {sub === "color" && (
            <div
              className="absolute left-full top-9 ml-1 w-44 rounded-xl border shadow-lg py-1.5"
              style={{ background: "var(--bg)", borderColor: "var(--border)" }}
            >
              <div className="px-3 py-1 text-xs" style={{ color: "var(--text-muted)" }}>Color Mode</div>
              {COLOR_LABELS.map((c) => (
                <SubOption
                  key={c.key}
                  icon={
                    <span
                      className="inline-block w-3.5 h-3.5 rounded-sm"
                      style={{ background: c.key === "black" ? "transparent" : ACCENT_SWATCH[c.key], border: c.key === "black" ? "1.5px solid var(--text)" : "none" }}
                    />
                  }
                  label={c.label}
                  checked={color === c.key}
                  onClick={() => setColor(c.key)}
                />
              ))}
            </div>
          )}

          <Link href="/settings" onClick={() => setOpen(false)}>
            <MenuRow icon={<Settings size={16} />} label="Settings" />
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}

function MenuRow({
  icon,
  label,
  trailing,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5 transition"
      style={{ color: "var(--text)", background: active ? "var(--bg-subtle)" : "transparent" }}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {trailing}
    </button>
  );
}

function SubOption({
  icon,
  label,
  checked,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  checked?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/5 transition"
      style={{ color: checked ? "var(--accent)" : "var(--text)" }}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {checked && <Check size={14} color="var(--accent)" />}
    </button>
  );
}
