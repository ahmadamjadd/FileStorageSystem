import { CheckCircle2, Loader2, X, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useUploads } from "./UploadProvider";

export function UploadPanel() {
  const { tasks, dismiss, clearFinished } = useUploads();
  if (tasks.length === 0) return null;

  const active = tasks.filter((t) => t.status === "uploading").length;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[19rem] overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-lift)]">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-sm font-medium">
          {active > 0 ? `Uploading ${active} file${active > 1 ? "s" : ""}` : "Uploads complete"}
        </p>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearFinished}>
          Clear
        </Button>
      </div>
      <ul className="max-h-60 divide-y divide-border overflow-y-auto">
        {tasks.map((task) => (
          <li key={task.id} className="px-3 py-2.5">
            <div className="flex items-center gap-2">
              {task.status === "uploading" && (
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
              )}
              {task.status === "done" && <CheckCircle2 className="size-4 shrink-0 text-primary" />}
              {task.status === "error" && (
                <AlertCircle className="size-4 shrink-0 text-destructive" />
              )}
              <span className="flex-1 truncate text-sm">{task.name}</span>
              <span className="text-xs text-muted-foreground">
                {task.status === "error" ? "Failed" : `${task.percent}%`}
              </span>
              <button
                aria-label="Dismiss"
                onClick={() => dismiss(task.id)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
            {task.status === "uploading" && <Progress value={task.percent} className="mt-2 h-1" />}
            {task.status === "error" && (
              <p className="mt-1 text-xs text-destructive">{task.error}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
