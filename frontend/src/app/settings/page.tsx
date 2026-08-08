"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, User, Sun, Square, Pencil, Check, Moon } from "lucide-react";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { useTheme, ACCENT_SWATCH, ColorMode } from "@/context/theme-context";
import { api } from "@/lib/api";

const NAV = [
  { key: "profile", label: "Profile", icon: User },
  { key: "theme", label: "Theme", icon: Sun },
  { key: "color", label: "Color", icon: Square },
] as const;

const COLOR_LABELS: { key: ColorMode; label: string }[] = [
  { key: "amber", label: "Amber" },
  { key: "blue", label: "Blue" },
  { key: "pink", label: "Pink" },
  { key: "rose", label: "Rose" },
  { key: "emerald", label: "Emerald" },
  { key: "black", label: "Black" },
];

type SaveState = "idle" | "saving" | "saved" | "offline";

export default function SettingsPage() {
  const { user, loading } = useRequireAuth();
  const { logout, apiConnected, refreshUser } = useAuth();
  const { mode, color, setMode, setColor } = useTheme();
  const [tab, setTab] = useState<"profile" | "theme" | "color">("profile");
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [title, setTitle] = useState(user?.title ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedOnce = useRef(false);

  useEffect(() => {
    if (!apiConnected) return;
    api
      .getMyProfile()
      .then((profile) => {
        setFullName(profile.fullName ?? "");
        setTitle(profile.title ?? "");
        setUsername(profile.username ?? "");
        loadedOnce.current = true;
      })
      .catch(() => {});
  }, [apiConnected]);

  const scheduleSave = (patch: { fullName?: string; title?: string; username?: string }) => {
    if (!apiConnected) {
      setSaveState("offline");
      return;
    }
    setSaveState("saving");
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await api.updateMyProfile(patch);
        await refreshUser(); // keep sidebar/user-menu display name in sync immediately
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      } catch {
        setSaveState("offline");
      }
    }, 500);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <aside className="w-[338px] shrink-0 border-r px-4 py-4" style={{ borderColor: "var(--border)" }}>
        <Link href="/tasks" className="flex items-center gap-2 text-sm mb-6 px-1" style={{ color: "var(--text)" }}>
          <ArrowLeft size={16} /> Back to app
        </Link>

        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-6" style={{ borderColor: "var(--border)" }}>
          <Search size={15} className="opacity-50" />
          <input placeholder="Search" className="flex-1 bg-transparent outline-none text-sm" style={{ color: "var(--text)" }} />
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = tab === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left"
                style={{ background: active ? "var(--bg-subtle)" : "transparent", color: "var(--text)" }}
              >
                <Icon size={16} />
                {n.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 px-10 py-10 max-w-3xl">
        {tab === "profile" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>Profile</h1>
              <SaveIndicator state={saveState} />
            </div>
            <div className="rounded-2xl border" style={{ borderColor: "var(--border)" }}>
              <SettingsRow label="Profile picture">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.avatarGradient}`} />
              </SettingsRow>
              <SettingsRow label="Email">
                <span className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                  {user.email}
                  <button className="p-1.5 rounded-full border" style={{ borderColor: "var(--border)" }}><Pencil size={12} /></button>
                </span>
              </SettingsRow>
              <SettingsRow label="Full name">
                <input
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    scheduleSave({ fullName: e.target.value });
                  }}
                  className="text-right bg-transparent outline-none text-sm w-56"
                  style={{ color: "var(--text)" }}
                />
              </SettingsRow>
              <SettingsRow label="Title" sublabel="Your job title or role">
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    scheduleSave({ title: e.target.value });
                  }}
                  className="text-right bg-transparent outline-none text-sm w-56"
                  style={{ color: "var(--text)" }}
                />
              </SettingsRow>
              <SettingsRow label="Username" sublabel="One word, like a nickname or first name" last>
                <input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    scheduleSave({ username: e.target.value });
                  }}
                  className="text-right bg-transparent outline-none text-sm w-56"
                  style={{ color: "var(--text)" }}
                />
              </SettingsRow>
            </div>

            <h2 className="text-lg font-semibold mt-8 mb-3" style={{ color: "var(--text)" }}>Workspace access</h2>
            <div className="rounded-2xl border px-5 py-4 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>Remove yourself from the workspace</span>
              <button onClick={logout} className="text-sm font-medium px-3.5 py-2 rounded-lg" style={{ background: "#fee2e2", color: "#dc2626" }}>
                Leave Workspace
              </button>
            </div>
          </>
        )}

        {tab === "theme" && (
          <>
            <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--text)" }}>Theme</h1>
            <div className="rounded-2xl border divide-y" style={{ borderColor: "var(--border)" }}>
              <ThemeOption icon={<Sun size={16} />} label="Light" checked={mode === "light"} onClick={() => setMode("light")} />
              <ThemeOption icon={<Moon size={16} />} label="Dark" checked={mode === "dark"} onClick={() => setMode("dark")} />
            </div>
          </>
        )}

        {tab === "color" && (
          <>
            <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--text)" }}>Color</h1>
            <div className="rounded-2xl border divide-y" style={{ borderColor: "var(--border)" }}>
              {COLOR_LABELS.map((c) => (
                <ThemeOption
                  key={c.key}
                  icon={<span className="inline-block w-4 h-4 rounded-sm" style={{ background: c.key === "black" ? "transparent" : ACCENT_SWATCH[c.key], border: c.key === "black" ? "1.5px solid var(--text)" : "none" }} />}
                  label={c.label}
                  checked={color === c.key}
                  onClick={() => setColor(c.key)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  const text = state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Offline — changes not saved";
  const color = state === "offline" ? "#dc2626" : "var(--text-muted)";
  return <span className="text-xs" style={{ color }}>{text}</span>;
}

function SettingsRow({ label, sublabel, children, last }: { label: string; sublabel?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-6 py-4 ${last ? "" : "border-b"}`} style={{ borderColor: "var(--border)" }}>
      <div>
        <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</div>
        {sublabel && <div className="text-xs" style={{ color: "var(--text-muted)" }}>{sublabel}</div>}
      </div>
      {children}
    </div>
  );
}

function ThemeOption({ icon, label, checked, onClick }: { icon: React.ReactNode; label: string; checked: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-6 py-4 text-sm hover:bg-black/[0.02]" style={{ color: "var(--text)" }}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {checked && <Check size={16} />}
    </button>
  );
}
