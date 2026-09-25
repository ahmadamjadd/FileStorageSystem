import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { UploadProvider } from "./UploadProvider";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !token) void navigate({ to: "/login", replace: true });
  }, [ready, token, navigate]);

  if (!ready || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="font-display text-xl font-semibold text-muted-foreground">Stash</span>
      </div>
    );
  }

  return <UploadProvider>{children}</UploadProvider>;
}
