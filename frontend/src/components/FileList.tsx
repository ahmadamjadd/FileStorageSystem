import { Link } from "@tanstack/react-router";
import { Folder as FolderIcon } from "lucide-react";
import type { FileItem, Folder } from "@/lib/api";
import { fileKind, formatBytes, formatDate, kindColor, kindIcon, kindLabel } from "@/lib/files";
import { cn } from "@/lib/utils";
import { ItemContextMenu, ItemMenu, type ItemActions } from "./ItemMenu";

interface Props {
  folders: Folder[];
  files: FileItem[];
  folderActions: (folder: Folder) => ItemActions;
  fileActions: (file: FileItem) => ItemActions;
}

export function FileList({ folders, files, folderActions, fileActions }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="hidden grid-cols-[minmax(0,1fr)_6rem_7rem_8rem_3rem] items-center gap-3 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
        <span>Name</span>
        <span>Size</span>
        <span>Type</span>
        <span>Modified</span>
        <span />
      </div>
      <ul className="divide-y divide-border">
        {folders.map((folder) => {
          const actions = folderActions(folder);
          return (
            <ItemContextMenu key={folder.id} actions={actions}>
              <li className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-secondary/60 sm:grid-cols-[minmax(0,1fr)_6rem_7rem_8rem_3rem]">
                <Link
                  to="/folder/$folderId"
                  params={{ folderId: folder.id }}
                  className="flex min-w-0 items-center gap-3"
                >
                  <FolderIcon className="size-4.5 shrink-0 text-primary" />
                  <span className="truncate text-sm font-medium">{folder.name}</span>
                </Link>
                <span className="hidden text-sm text-muted-foreground sm:block">—</span>
                <span className="hidden text-sm text-muted-foreground sm:block">Folder</span>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {formatDate(folder.created_at)}
                </span>
                <div className="justify-self-end">
                  <ItemMenu actions={actions} />
                </div>
              </li>
            </ItemContextMenu>
          );
        })}

        {files.map((file) => {
          const kind = fileKind(file.mime_type, file.name);
          const Icon = kindIcon[kind];
          const actions = fileActions(file);
          return (
            <ItemContextMenu key={file.id} actions={actions}>
              <li className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-secondary/60 sm:grid-cols-[minmax(0,1fr)_6rem_7rem_8rem_3rem]">
                <div className="flex min-w-0 items-center gap-3">
                  <Icon className={cn("size-4.5 shrink-0", kindColor[kind])} />
                  <span className="truncate text-sm">{file.name}</span>
                </div>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {formatBytes(file.size_bytes)}
                </span>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {kindLabel[kind]}
                </span>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {formatDate(file.updated_at)}
                </span>
                <div className="justify-self-end">
                  <ItemMenu actions={actions} />
                </div>
              </li>
            </ItemContextMenu>
          );
        })}
      </ul>
    </div>
  );
}
