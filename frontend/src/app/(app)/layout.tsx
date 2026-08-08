"use client";

import Sidebar from "@/components/sidebar";
import { useRequireAuth } from "@/context/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
