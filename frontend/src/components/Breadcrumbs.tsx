import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Folder } from "@/lib/api";

export function Breadcrumbs({ path }: { path: Folder[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
      {path.length === 0 ? (
        <span className="font-display text-lg font-semibold">My Files</span>
      ) : (
        <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
          My Files
        </Link>
      )}
      {path.map((folder, index) => {
        const last = index === path.length - 1;
        return (
          <span key={folder.id} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
            {last ? (
              <span className="truncate font-display text-lg font-semibold">{folder.name}</span>
            ) : (
              <Link
                to="/folder/$folderId"
                params={{ folderId: folder.id }}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {folder.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
