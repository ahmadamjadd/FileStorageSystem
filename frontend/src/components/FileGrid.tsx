import { Link } from "@tanstack/react-router";
import { Folder as FolderIcon } from "lucide-react";
import type { FileItem, Folder } from "@/lib/api";
import { fileKind, formatBytes, kindColor, kindIcon } from "@/lib/files";
import { cn } from "@/lib/utils";
import { ItemContextMenu, ItemMenu, type ItemActions } from "./ItemMenu";

interface Props {
  folders: Folder[];
  files: FileItem[];
  folderActions: (folder: Folder) => ItemActions;
  fileActions: (file: FileItem) => ItemActions;
}

export function FileGrid({ folders, files, folderActions, fileActions }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {folders.map((folder) => {
        const actions = folderActions(folder);
        return (
          <ItemContextMenu key={folder.id} actions={actions}>
            <div className="group relative rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40">
              <div className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <ItemMenu actions={actions} />
              </div>
              <Link to="/folder/$folderId" params={{ folderId: folder.id }} className="block">
                <FolderIcon className="size-8 text-primary" />
                <p className="mt-3 truncate text-sm font-medium">{folder.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Folder</p>
              </Link>
            </div>
          </ItemContextMenu>
        );
      })}

      {files.map((file) => {
        const kind = fileKind(file.mime_type, file.name);
        const Icon = kindIcon[kind];
        const actions = fileActions(file);
        return (
          <ItemContextMenu key={file.id} actions={actions}>
            <div className="group relative rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40">
              <div className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <ItemMenu actions={actions} />
              </div>
              <Icon className={cn("size-8", kindColor[kind])} />
              <p className="mt-3 truncate text-sm">{file.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatBytes(file.size_bytes)}
              </p>
            </div>
          </ItemContextMenu>
        );
      })}
    </div>
  );
}
