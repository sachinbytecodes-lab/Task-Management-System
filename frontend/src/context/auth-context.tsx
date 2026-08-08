"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { gradientForId } from "@/lib/avatar-gradient";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  title?: string;
  username?: string;
  guest: boolean;
  profileComplete: boolean;
  avatarGradient: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  apiConnected: boolean;
  continueAsGuest: () => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_KEY = "pyramid-auth-user";

function fromApiProfile(p: any): AuthUser {
  return {
    id: p._id ?? p.id,
    name: p.fullName?.trim() ? p.fullName : (p.email?.split("@")[0] ?? "User"),
    email: p.email,
    title: p.title,
    username: p.username,
    guest: !!p.isGuest,
    profileComplete: p.profileComplete !== false,
    avatarGradient: gradientForId(p._id ?? p.id),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  const loadFromApi = async () => {
    const profile = await api.getMyProfile();
    setUser(fromApiProfile(profile));
    setApiConnected(true);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadFromApi();
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
      await api.guestLogin();
      await loadFromApi();
    } catch {
      // API not running — demo still works locally, distinct guest id per browser session
      const id = `local-${Date.now()}`;
      persistLocal({
        id,
        name: "Dexter",
        email: "dexter@gmail.com",
        guest: true,
        profileComplete: true,
        avatarGradient: gradientForId(id),
      });
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
    setApiConnected(false);
    localStorage.removeItem(AUTH_KEY);
  };

  const refreshUser = async () => {
    if (!apiConnected) return;
    try {
      await loadFromApi();
    } catch {
      // ignore transient failures
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, apiConnected, continueAsGuest, loginWithGoogle, logout, refreshUser }}>
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
