import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as api from "./api";
import type { User } from "./api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(api.getToken());
    setUser(api.getStoredUser());
    setReady(true);

    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("stash:unauthorized", onUnauthorized);
    return () => window.removeEventListener("stash:unauthorized", onUnauthorized);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const res = await api.register(email, password);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const signOut = useCallback(() => {
    api.clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, ready, signIn, signUp, signOut }),
    [user, token, ready, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Any 401 from the API layer clears the token and bounces to /login. */
export function handleApiError(error: unknown): void {
  if (error instanceof api.ApiError && error.status === 401) {
    api.clearSession();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("stash:unauthorized"));
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
  }
}
