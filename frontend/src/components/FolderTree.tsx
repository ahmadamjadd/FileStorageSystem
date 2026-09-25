import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Folder as FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TreeNode } from "@/lib/files";

interface FolderTreeProps {
  nodes: TreeNode[];
  activeFolderId: string | null;
  ancestorIds: string[];
  depth?: number;
  onNavigate?: (() => void) | undefined;
}

export function FolderTree({
  nodes,
  activeFolderId,
  ancestorIds,
  depth = 0,
  onNavigate,
}: FolderTreeProps) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          activeFolderId={activeFolderId}
          ancestorIds={ancestorIds}
          depth={depth}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}

function TreeItem({
  node,
  activeFolderId,
  ancestorIds,
  depth,
  onNavigate,
}: {
  node: TreeNode;
  activeFolderId: string | null;
  ancestorIds: string[];
  depth: number;
  onNavigate?: (() => void) | undefined;
}) {
  const [open, setOpen] = useState(ancestorIds.includes(node.id));
  const isActive = activeFolderId === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg pr-1 transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "hover:bg-sidebar-accent/60",
        )}
        style={{ paddingLeft: `${depth * 0.75}rem` }}
      >
        <button
          aria-label={open ? "Collapse" : "Expand"}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded text-muted-foreground transition-transform",
            open && "rotate-90",
            !hasChildren && "invisible",
          )}
        >
          <ChevronRight className="size-3.5" />
        </button>
        <Link
          to="/folder/$folderId"
          params={{ folderId: node.id }}
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-sm"
        >
          <FolderIcon
            className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")}
          />
          <span className="truncate">{node.name}</span>
        </Link>
      </div>
      {open && hasChildren && (
        <div className="mt-0.5">
          <FolderTree
            nodes={node.children}
            activeFolderId={activeFolderId}
            ancestorIds={ancestorIds}
            depth={depth + 1}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </li>
  );
}
