"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface AuthUser {
  name: string;
  email: string;
  guest: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  apiConnected: boolean;
  continueAsGuest: () => void;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_KEY = "pyramid-auth-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    (async () => {
      // Try the real backend first (cookie-based session)
      try {
        const me = await api.me();
        setUser({ name: me.email?.split("@")[0] ?? "User", email: me.email, guest: false });
        setApiConnected(true);
      } catch {
        // Backend not reachable / not logged in there — fall back to local-only mock mode
        const stored = localStorage.getItem(AUTH_KEY);
        if (stored) setUser(JSON.parse(stored));
      }
      setLoading(false);
    })();
  }, []);

  const persistLocal = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  };

  const continueAsGuest = async () => {
    try {
      const { user: apiUser } = await api.guestLogin();
      setApiConnected(true);
      persistLocal({ name: apiUser.fullName ?? "Guest", email: apiUser.email, guest: true });
    } catch {
      // API not running — demo still works locally
      persistLocal({ name: "Dexter", email: "dexter@gmail.com", guest: true });
    }
  };

  const loginWithGoogle = () => {
    // Full page redirect into the real Google OAuth flow served by the API
    window.location.href = api.googleLoginUrl();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore — API may not be running
    }
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, apiConnected, continueAsGuest, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);
  return { user, loading };
}
