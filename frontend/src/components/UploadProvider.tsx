import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { handleApiError } from "@/lib/auth";

export interface UploadTask {
  id: string;
  name: string;
  percent: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

interface UploadContextValue {
  tasks: UploadTask[];
  startUploads: (files: File[], folderId: string | null) => void;
  dismiss: (id: string) => void;
  clearFinished: () => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const queryClient = useQueryClient();

  const update = useCallback((id: string, patch: Partial<UploadTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const startUploads = useCallback(
    (files: File[], folderId: string | null) => {
      files.forEach((file) => {
        const taskId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setTasks((prev) => [
          ...prev,
          { id: taskId, name: file.name, percent: 0, status: "uploading" },
        ]);

        void (async () => {
          try {
            const ticket = await api.requestUploadUrl({
              filename: file.name,
              mime_type: file.type,
              size_bytes: file.size,
              folder_id: folderId,
            });
            await api.uploadToUrl(ticket.upload_url, file, (percent) =>
              update(taskId, { percent }),
            );
            await api.confirmUpload(ticket.file_id);
            update(taskId, { percent: 100, status: "done" });
            void queryClient.invalidateQueries({ queryKey: ["folder-contents", folderId] });
          } catch (error) {
            handleApiError(error);
            update(taskId, {
              status: "error",
              error: error instanceof Error ? error.message : "Upload failed",
            });
          }
        })();
      });
    },
    [queryClient, update],
  );

  const dismiss = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearFinished = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.status === "uploading"));
  }, []);

  const value = useMemo(
    () => ({ tasks, startUploads, dismiss, clearFinished }),
    [tasks, startUploads, dismiss, clearFinished],
  );

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
}

export function useUploads(): UploadContextValue {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUploads must be used inside UploadProvider");
  return ctx;
}
