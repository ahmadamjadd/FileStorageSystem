import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LayoutGrid, List, Menu, Search, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import * as api from "@/lib/api";
import type { FileItem, Folder } from "@/lib/api";
import { handleApiError, useAuth } from "@/lib/auth";
import { buildTree, folderPath } from "@/lib/files";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Sidebar } from "./Sidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { FileList } from "./FileList";
import { FileGrid } from "./FileGrid";
import { UploadPanel } from "./UploadPanel";
import { useUploads } from "./UploadProvider";
import type { ItemActions } from "./ItemMenu";

type ViewMode = "list" | "grid";
type Target = { kind: "folder"; item: Folder } | { kind: "file"; item: FileItem };

export function FileBrowser({ folderId }: { folderId: string | null }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { startUploads } = useUploads();

  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [dragging, setDragging] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameTarget, setRenameTarget] = useState<Target | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Target | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  useEffect(() => setQuery(""), [folderId]);

  const treeQuery = useQuery({ queryKey: ["folder-tree"], queryFn: api.getFolderTree });
  const contentsQuery = useQuery({
    queryKey: ["folder-contents", folderId],
    queryFn: () => api.getFolderContents(folderId),
  });

  useEffect(() => {
    if (treeQuery.error) handleApiError(treeQuery.error);
    if (contentsQuery.error) handleApiError(contentsQuery.error);
  }, [treeQuery.error, contentsQuery.error]);

  const tree = useMemo(() => buildTree(treeQuery.data ?? []), [treeQuery.data]);
  const path = useMemo(() => folderPath(treeQuery.data ?? [], folderId), [treeQuery.data, folderId]);
  const ancestorIds = useMemo(() => path.map((f) => f.id), [path]);

  const needle = query.trim().toLowerCase();
  const folders = (contentsQuery.data?.folders ?? []).filter((f) =>
    f.name.toLowerCase().includes(needle),
  );
  const files = (contentsQuery.data?.files ?? []).filter((f) =>
    f.name.toLowerCase().includes(needle),
  );

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["folder-tree"] });
    void queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
  }

  function fail(error: unknown, fallback: string) {
    handleApiError(error);
    toast.error(error instanceof Error ? error.message : fallback);
  }

  const createFolder = useMutation({
    mutationFn: (name: string) => api.createFolder(name, folderId),
    onSuccess: (folder) => {
      refresh();
      setNewFolderOpen(false);
      setNewFolderName("");
      toast.success(`Created “${folder.name}”`);
    },
    onError: (error) => fail(error, "Could not create the folder."),
  });

  const rename = useMutation({
    mutationFn: async ({ target, name }: { target: Target; name: string }): Promise<void> => {
      if (target.kind === "folder") await api.renameFolder(target.item.id, name);
      else await api.renameFile(target.item.id, name);
    },
    onSuccess: () => {
      refresh();
      setRenameTarget(null);
      toast.success("Renamed");
    },
    onError: (error) => fail(error, "Could not rename."),
  });

  const remove = useMutation({
    mutationFn: (target: Target) =>
      target.kind === "folder" ? api.deleteFolder(target.item.id) : api.deleteFile(target.item.id),
    onSuccess: (_data, target) => {
      refresh();
      setDeleteTarget(null);
      toast.success("Deleted");
      if (target.kind === "folder" && ancestorIds.includes(target.item.id)) {
        void navigate({ to: "/" });
      }
    },
    onError: (error) => fail(error, "Could not delete."),
  });

  async function download(file: FileItem) {
    try {
      const { download_url } = await api.getDownloadUrl(file.id);
      const link = document.createElement("a");
      link.href = download_url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      fail(error, "Could not download the file.");
    }
  }

  const folderActions = (folder: Folder): ItemActions => ({
    onRename: () => {
      setRenameTarget({ kind: "folder", item: folder });
      setRenameValue(folder.name);
    },
    onDelete: () => setDeleteTarget({ kind: "folder", item: folder }),
  });

  const fileActions = (file: FileItem): ItemActions => ({
    onRename: () => {
      setRenameTarget({ kind: "file", item: file });
      setRenameValue(file.name);
    },
    onDelete: () => setDeleteTarget({ kind: "file", item: file }),
    onDownload: () => void download(file),
  });

  function handleSignOut() {
    void queryClient.cancelQueries();
    queryClient.clear();
    signOut();
    void navigate({ to: "/login", replace: true });
  }

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const sidebar = (onNavigate?: (() => void) | undefined) => (
    <Sidebar
      tree={tree}
      loading={treeQuery.isLoading}
      activeFolderId={folderId}
      ancestorIds={ancestorIds}
      email={user?.email ?? ""}
      theme={theme}
      onToggleTheme={toggleTheme}
      onSignOut={handleSignOut}
      onNewFolder={() => {
        onNavigate?.();
        setNewFolderOpen(true);
      }}
      onUpload={() => {
        onNavigate?.();
        fileInputRef.current?.click();
      }}
      onNavigate={onNavigate}
    />
  );

  const isEmpty = !contentsQuery.isLoading && folders.length === 0 && files.length === 0;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border md:block">
        <div className="sticky top-0 h-screen">{sidebar()}</div>
      </aside>

      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="w-72 p-0">
          {sidebar(() => setMobileNav(false))}
        </SheetContent>
      </Sheet>

      <main
        className="relative min-w-0 flex-1"
        onDragEnter={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          const dropped = Array.from(e.dataTransfer.files);
          if (dropped.length > 0) startUploads(dropped, folderId);
        }}
      >
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileNav(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <Breadcrumbs path={path} />
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this folder"
              className="pl-9"
            />
          </div>

          <div className="flex items-center rounded-lg border border-border p-0.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="List view"
              onClick={() => setView("list")}
              className={cn("size-8", view === "list" && "bg-accent text-accent-foreground")}
            >
              <List className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Grid view"
              onClick={() => setView("grid")}
              className={cn("size-8", view === "grid" && "bg-accent text-accent-foreground")}
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
        </header>

        <div className="px-4 py-6 md:px-6">
          {contentsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : contentsQuery.isError ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="font-display text-lg font-semibold">This folder didn’t load</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check your connection and try again.
              </p>
              <Button className="mt-4" onClick={() => void contentsQuery.refetch()}>
                Try again
              </Button>
            </div>
          ) : isEmpty ? (
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-12 text-center">
              <UploadCloud className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-4 font-display text-lg font-semibold">
                {needle ? "Nothing matches that search" : "This folder is empty"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {needle
                  ? "Try a different name."
                  : "Drop files here or use New to add something."}
              </p>
            </div>
          ) : view === "list" ? (
            <FileList
              folders={folders}
              files={files}
              folderActions={folderActions}
              fileActions={fileActions}
            />
          ) : (
            <FileGrid
              folders={folders}
              files={files}
              folderActions={folderActions}
              fileActions={fileActions}
            />
          )}
        </div>

        {dragging && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-primary/10 p-6">
            <div className="rounded-xl border-2 border-dashed border-primary bg-card px-8 py-6 text-center shadow-[var(--shadow-lift)]">
              <UploadCloud className="mx-auto size-8 text-primary" />
              <p className="mt-3 font-display text-lg font-semibold">Drop to upload</p>
              <p className="text-sm text-muted-foreground">
                Files land in {path.at(-1)?.name ?? "My Files"}
              </p>
            </div>
          </div>
        )}
      </main>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          if (picked.length > 0) startUploads(picked, folderId);
          e.target.value = "";
        }}
      />

      <UploadPanel />

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription>
              Created in {path.at(-1)?.name ?? "My Files"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="folder-name">Name</Label>
            <Input
              id="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Untitled folder"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={newFolderName.trim().length === 0 || createFolder.isPending}
              onClick={() => createFolder.mutate(newFolderName)}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameTarget?.kind === "folder" ? "folder" : "file"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="rename-value">Name</Label>
            <Input
              id="rename-value"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={renameValue.trim().length === 0 || rename.isPending}
              onClick={() =>
                renameTarget && rename.mutate({ target: renameTarget, name: renameValue })
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteTarget?.item.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.kind === "folder"
                ? "Everything inside this folder, including subfolders and their files, is removed too. This cannot be undone."
                : "This file is removed permanently and cannot be recovered."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && remove.mutate(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
