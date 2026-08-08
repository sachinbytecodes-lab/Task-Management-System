"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";

export default function OnboardingPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user?.profileComplete) router.replace("/tasks");
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">Loading…</div>;
  }

  const submit = async () => {
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.updateMyProfile({
        fullName: fullName.trim(),
        title: title.trim() || undefined,
        username: username.trim() || undefined,
      });
      // Mark onboarding complete explicitly
      await api.updateMyProfile({ profileComplete: true } as any);
      await refreshUser();
      router.push("/tasks");
    } catch {
      setError("Couldn't save your profile — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-md bg-neutral-900 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M12 2 L22 20 L2 20 Z" />
            </svg>
          </div>
          <span className="font-semibold text-lg" style={{ color: "var(--text)" }}>Pyramid</span>
        </div>

        <div className="rounded-2xl border p-8" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
          <h1 className="text-2xl font-bold text-center mb-1" style={{ color: "var(--text)" }}>
            Finish setting up your account
          </h1>
          <p className="text-center text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            We got your email from Google — just fill in the rest.
          </p>

          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Email</label>
          <input
            value={user.email}
            disabled
            className="w-full border rounded-lg px-3 py-2.5 text-sm mb-4 opacity-60"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          />

          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Full name</label>
          <input
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full border rounded-lg px-3 py-2.5 text-sm mb-4"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          />

          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Title <span className="opacity-60">(optional)</span></label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Designer, Engineer, PM…"
            className="w-full border rounded-lg px-3 py-2.5 text-sm mb-4"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          />

          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Username <span className="opacity-60">(optional)</span></label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="janedoe"
            className="w-full border rounded-lg px-3 py-2.5 text-sm mb-6"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          />

          {error && <p className="text-sm mb-4" style={{ color: "#dc2626" }}>{error}</p>}

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full rounded-full font-medium py-3 text-white disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {submitting ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>
    </main>
  );
}
