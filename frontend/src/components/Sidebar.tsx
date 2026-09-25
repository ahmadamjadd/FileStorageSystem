import { Link } from "@tanstack/react-router";
import {
  FolderPlus,
  HardDrive,
  LogOut,
  Moon,
  Plus,
  Sun,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TreeNode } from "@/lib/files";
import { FolderTree } from "./FolderTree";

interface SidebarProps {
  tree: TreeNode[];
  loading: boolean;
  activeFolderId: string | null;
  ancestorIds: string[];
  email: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onSignOut: () => void;
  onNewFolder: () => void;
  onUpload: () => void;
  onNavigate?: (() => void) | undefined;
}

export function Sidebar({
  tree,
  loading,
  activeFolderId,
  ancestorIds,
  email,
  theme,
  onToggleTheme,
  onSignOut,
  onNewFolder,
  onUpload,
  onNavigate,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-5">
        <Link to="/" onClick={onNavigate} className="font-display text-xl font-semibold">
          Stash
        </Link>
      </div>

      <div className="px-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-start gap-2">
              <Plus className="size-4" /> New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onSelect={onNewFolder}>
              <FolderPlus className="size-4" /> New folder
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onUpload}>
              <Upload className="size-4" /> Upload file
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
        <Link
          to="/"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
            activeFolderId === null
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent/60",
          )}
        >
          <HardDrive className="size-4" /> My Files
        </Link>

        <p className="mt-5 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Folders
        </p>
        <div className="mt-2">
          {loading ? (
            <div className="space-y-2 px-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : tree.length === 0 ? (
            <p className="px-2 text-sm text-muted-foreground">No folders yet.</p>
          ) : (
            <FolderTree
              nodes={tree}
              activeFolderId={activeFolderId}
              ancestorIds={ancestorIds}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent/60">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-highlight text-sm font-medium text-highlight-foreground">
                {email.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{email}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem onSelect={onToggleTheme}>
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {theme === "dark" ? "Light theme" : "Dark theme"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onSignOut} className="text-destructive">
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
