"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const { user, loading, continueAsGuest, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/tasks");
  }, [user, loading, router]);

  const handleGuest = async () => {
    await continueAsGuest();
    router.push("/tasks");
  };

  const handleGoogle = () => {
    loginWithGoogle();
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

        <div
          className="rounded-2xl border p-8"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}
        >
          <h1 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--text)" }}>
            Let&apos;s get back on track
          </h1>
          <p className="text-center text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Enter your email below to login to your account.
          </p>

          <button
            onClick={handleGuest}
            className="w-full rounded-full bg-neutral-900 text-white font-medium py-3 mb-3 hover:opacity-90 transition"
          >
            Continue as Guest
          </button>

          <button
            onClick={handleGoogle}
            className="w-full rounded-full border font-medium py-3 flex items-center justify-center gap-2 hover:bg-neutral-50 transition"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            <GoogleIcon />
            Login with Google
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline">Terms of Service</a> and{" "}
          <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a10.99 10.99 0 0 0-9.82 6.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}
