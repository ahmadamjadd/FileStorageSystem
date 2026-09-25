import {
  File as FileIconBase,
  FileArchive,
  FileCode,
  FileText,
  Image as ImageIcon,
  FileType,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Folder } from "./api";

export type FileKind = "image" | "pdf" | "doc" | "archive" | "code" | "other";

export function fileKind(mime: string, name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (/(msword|officedocument|rtf)/.test(mime) || ["doc", "docx", "txt", "md", "rtf"].includes(ext))
    return "doc";
  if (/(zip|tar|rar|7z|gzip)/.test(mime) || ["zip", "tar", "gz", "rar", "7z"].includes(ext))
    return "archive";
  if (
    /(javascript|typescript|json|xml|html|css)/.test(mime) ||
    ["ts", "tsx", "js", "jsx", "json", "py", "rb", "go", "rs", "css", "html", "sh"].includes(ext)
  )
    return "code";
  return "other";
}

export const kindIcon: Record<FileKind, LucideIcon> = {
  image: ImageIcon,
  pdf: FileType,
  doc: FileText,
  archive: FileArchive,
  code: FileCode,
  other: FileIconBase,
};

export const kindColor: Record<FileKind, string> = {
  image: "text-file-image",
  pdf: "text-file-pdf",
  doc: "text-file-doc",
  archive: "text-file-archive",
  code: "text-file-code",
  other: "text-file-other",
};

export const kindLabel: Record<FileKind, string> = {
  image: "Image",
  pdf: "PDF",
  doc: "Document",
  archive: "Archive",
  code: "Code",
  other: "File",
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const days = (Date.now() - date.getTime()) / 86_400_000;
  if (days < 1) return "Today";
  if (days < 2) return "Yesterday";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export interface TreeNode extends Folder {
  children: TreeNode[];
}

export function buildTree(folders: Folder[]): TreeNode[] {
  const byId = new Map<string, TreeNode>();
  folders.forEach((f) => byId.set(f.id, { ...f, children: [] }));
  const roots: TreeNode[] = [];
  byId.forEach((node) => {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

export function folderPath(folders: Folder[], folderId: string | null): Folder[] {
  const path: Folder[] = [];
  let current = folderId ? folders.find((f) => f.id === folderId) : undefined;
  while (current) {
    path.unshift(current);
    const parentId: string | null = current.parent_id;
    current = parentId ? folders.find((f) => f.id === parentId) : undefined;
  }
  return path;
}
