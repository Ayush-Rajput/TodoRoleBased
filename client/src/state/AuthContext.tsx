import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api";
import type { User } from "../types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api<{ user: User }>("/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const result = await api<{ token: string; user: User }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
        localStorage.setItem("token", result.token);
        setUser(result.user);
      },
      async signup(name, email, password) {
        const result = await api<{ token: string; user: User }>("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ name, email, password })
        });
        localStorage.setItem("token", result.token);
        setUser(result.user);
      },
      logout() {
        localStorage.removeItem("token");
        setUser(null);
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
