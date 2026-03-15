import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { clearToken, clearUser, getUser, saveToken, saveUser } from "../utils/storage";
import type { Role } from "../utils/constants";

type User = {
  _id: string;
  username: string;
  email: string;
  role: Role;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = async () => {
    const res = await api.get("/auth/me");
    const nextUser = res.data?.data?.user as User;
    setUser(nextUser);
    await saveUser(nextUser);
  };

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await getUser();
        if (storedUser) setUser(storedUser);
        await refreshMe();
      } catch {
        // Session may not exist yet.
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    login: async (email, password) => {
      const res = await api.post("/auth/login", { email, password });
      const nextUser = res.data?.data?.user as User;
      const setCookie = res.headers?.["set-cookie"]?.[0] as string | undefined;
      if (setCookie?.includes("jwt=")) {
        const raw = setCookie.split("jwt=")[1]?.split(";")[0];
        if (raw) await saveToken(raw);
      }
      setUser(nextUser);
      await saveUser(nextUser);
    },
    register: async (payload) => {
      await api.post("/auth/register", payload);
    },
    logout: async () => {
      try {
        await api.post("/auth/logout");
      } finally {
        setUser(null);
        await clearUser();
        await clearToken();
      }
    },
    refreshMe,
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
