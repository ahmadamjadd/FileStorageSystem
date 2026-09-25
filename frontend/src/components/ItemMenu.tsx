import { Download, MoreHorizontal, PencilLine, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export interface ItemActions {
  onRename: () => void;
  onDelete: () => void;
  onDownload?: () => void;
}

export function ItemMenu({ actions }: { actions: ItemActions }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Item actions"
          className="size-8 text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={actions.onRename}>
          <PencilLine className="size-4" /> Rename
        </DropdownMenuItem>
        {actions.onDownload && (
          <DropdownMenuItem onSelect={actions.onDownload}>
            <Download className="size-4" /> Download
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={actions.onDelete} className="text-destructive">
          <Trash2 className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ItemContextMenu({
  actions,
  children,
  asChild = true,
}: {
  actions: ItemActions;
  children: ReactNode;
  asChild?: boolean;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild={asChild}>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-44">
        <ContextMenuItem onSelect={actions.onRename}>
          <PencilLine className="size-4" /> Rename
        </ContextMenuItem>
        {actions.onDownload && (
          <ContextMenuItem onSelect={actions.onDownload}>
            <Download className="size-4" /> Download
          </ContextMenuItem>
        )}
        <ContextMenuItem onSelect={actions.onDelete} className="text-destructive">
          <Trash2 className="size-4" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
