import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime, a as Overlay2, c as Title2, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, i as Description2, l as Dialog$1, m as DialogPortal$1, n as Cancel, o as Portal2, p as DialogOverlay$1, r as Content2, s as Root2, t as Action, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as deleteFolder, c as getFolderTree, d as renameFolder, f as requestUploadUrl, i as deleteFile, l as handleApiError, m as useAuth, n as confirmUpload, o as getDownloadUrl, p as uploadToUrl, r as createFolder, s as getFolderContents, u as renameFile } from "./auth-DVzjrRpl.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as cn, i as buttonVariants, n as Input, r as Label, t as Button } from "./label-Brx6oFEd.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as Check, C as Ellipsis, D as CircleCheck, E as Circle, O as CircleAlert, S as FileArchive, T as CloudUpload, _ as FolderPlus, a as Search, b as FileText, c as Moon, d as LoaderCircle, f as List, g as Folder, h as HardDrive, i as Sun, k as ChevronRight, l as Menu, m as Image, n as Upload, o as Plus, p as LayoutGrid, r as Trash2, s as PencilLine, t as X, u as LogOut, v as File, w as Download, x as FileCode, y as FileType } from "../_libs/lucide-react.mjs";
import { a as Label2, c as Root2$1, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2$1, o as Portal2$1, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-context-menu+[...].mjs";
import { a as Label2$1, c as Root2$2, d as SubTrigger2$1, f as Trigger$1, i as ItemIndicator2$1, l as Separator2$1, n as Content2$2, o as Portal2$2, r as Item2$1, s as RadioItem2$1, t as CheckboxItem2$1, u as SubContent2$1 } from "../_libs/radix-ui__react-dropdown-menu.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RequireAuth-C3PB4HtV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fileKind(mime, name) {
	const ext = name.split(".").pop()?.toLowerCase() ?? "";
	if (mime.startsWith("image/")) return "image";
	if (mime === "application/pdf" || ext === "pdf") return "pdf";
	if (/(msword|officedocument|rtf)/.test(mime) || [
		"doc",
		"docx",
		"txt",
		"md",
		"rtf"
	].includes(ext)) return "doc";
	if (/(zip|tar|rar|7z|gzip)/.test(mime) || [
		"zip",
		"tar",
		"gz",
		"rar",
		"7z"
	].includes(ext)) return "archive";
	if (/(javascript|typescript|json|xml|html|css)/.test(mime) || [
		"ts",
		"tsx",
		"js",
		"jsx",
		"json",
		"py",
		"rb",
		"go",
		"rs",
		"css",
		"html",
		"sh"
	].includes(ext)) return "code";
	return "other";
}
var kindIcon = {
	image: Image,
	pdf: FileType,
	doc: FileText,
	archive: FileArchive,
	code: FileCode,
	other: File
};
var kindColor = {
	image: "text-file-image",
	pdf: "text-file-pdf",
	doc: "text-file-doc",
	archive: "text-file-archive",
	code: "text-file-code",
	other: "text-file-other"
};
var kindLabel = {
	image: "Image",
	pdf: "PDF",
	doc: "Document",
	archive: "Archive",
	code: "Code",
	other: "File"
};
function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	const units = [
		"KB",
		"MB",
		"GB",
		"TB"
	];
	let value = bytes / 1024;
	let i = 0;
	while (value >= 1024 && i < units.length - 1) {
		value /= 1024;
		i++;
	}
	return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}
function formatDate(iso) {
	const date = new Date(iso);
	const days = (Date.now() - date.getTime()) / 864e5;
	if (days < 1) return "Today";
	if (days < 2) return "Yesterday";
	return date.toLocaleDateString(void 0, {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
function buildTree(folders) {
	const byId = /* @__PURE__ */ new Map();
	folders.forEach((f) => byId.set(f.id, {
		...f,
		children: []
	}));
	const roots = [];
	byId.forEach((node) => {
		if (node.parent_id && byId.has(node.parent_id)) byId.get(node.parent_id).children.push(node);
		else roots.push(node);
	});
	const sort = (nodes) => {
		nodes.sort((a, b) => a.name.localeCompare(b.name));
		nodes.forEach((n) => sort(n.children));
	};
	sort(roots);
	return roots;
}
function folderPath(folders, folderId) {
	const path = [];
	let current = folderId ? folders.find((f) => f.id === folderId) : void 0;
	while (current) {
		path.unshift(current);
		const parentId = current.parent_id;
		current = parentId ? folders.find((f) => f.id === parentId) : void 0;
	}
	return path;
}
var KEY = "stash.theme";
function getStoredTheme() {
	if (typeof window === "undefined") return "light";
	return window.localStorage.getItem(KEY) === "dark" ? "dark" : "light";
}
function applyTheme(theme) {
	if (typeof document === "undefined") return;
	document.documentElement.classList.toggle("dark", theme === "dark");
	window.localStorage.setItem(KEY, theme);
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
var Sheet = Dialog$1;
var SheetPortal = DialogPortal$1;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay$1.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent$1.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle$1.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription$1.displayName;
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var AlertDialog = Root2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	className: cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("text-lg font-semibold", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
var DropdownMenu = Root2$2;
var DropdownMenuTrigger = Trigger$1;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2$1, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2$1.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2$1, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2$1.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2$2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2$2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2$1, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2$1.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2$1, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2$1.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2$1, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2$1.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2$1.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2$1.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
function FolderTree({ nodes, activeFolderId, ancestorIds, depth = 0, onNavigate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-0.5",
		children: nodes.map((node) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeItem, {
			node,
			activeFolderId,
			ancestorIds,
			depth,
			onNavigate
		}, node.id))
	});
}
function TreeItem({ node, activeFolderId, ancestorIds, depth, onNavigate }) {
	const [open, setOpen] = (0, import_react.useState)(ancestorIds.includes(node.id));
	const isActive = activeFolderId === node.id;
	const hasChildren = node.children.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-1 rounded-lg pr-1 transition-colors", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"),
		style: { paddingLeft: `${depth * .75}rem` },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			"aria-label": open ? "Collapse" : "Expand",
			onClick: () => setOpen((v) => !v),
			className: cn("grid size-5 shrink-0 place-items-center rounded text-muted-foreground transition-transform", open && "rotate-90", !hasChildren && "invisible"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/folder/$folderId",
			params: { folderId: node.id },
			onClick: onNavigate,
			className: "flex min-w-0 flex-1 items-center gap-2 py-1.5 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				children: node.name
			})]
		})]
	}), open && hasChildren && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-0.5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderTree, {
			nodes: node.children,
			activeFolderId,
			ancestorIds,
			depth: depth + 1,
			onNavigate
		})
	})] });
}
function Sidebar({ tree, loading, activeFolderId, ancestorIds, email, theme, onToggleTheme, onSignOut, onNewFolder, onUpload, onNavigate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col bg-sidebar text-sidebar-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 py-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					onClick: onNavigate,
					className: "font-display text-xl font-semibold",
					children: "Stash"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full justify-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "start",
					className: "w-48",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onSelect: onNewFolder,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderPlus, { className: "size-4" }), " New folder"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onSelect: onUpload,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), " Upload file"]
					})]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "mt-5 flex-1 overflow-y-auto px-3 pb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						onClick: onNavigate,
						className: cn("flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors", activeFolderId === null ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardDrive, { className: "size-4" }), " My Files"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
						children: "Folders"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 px-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-3/4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-2/3" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-1/2" })
							]
						}) : tree.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-2 text-sm text-muted-foreground",
							children: "No folders yet."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderTree, {
							nodes: tree,
							activeFolderId,
							ancestorIds,
							onNavigate
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-sidebar-border p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 shrink-0 place-items-center rounded-full bg-highlight text-sm font-medium text-highlight-foreground",
							children: email.charAt(0).toUpperCase()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm",
							children: email
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "start",
					side: "top",
					className: "w-56",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onSelect: onToggleTheme,
							children: [theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" }), theme === "dark" ? "Light theme" : "Dark theme"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onSelect: onSignOut,
							className: "text-destructive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Log out"]
						})
					]
				})] })
			})
		]
	});
}
function Breadcrumbs({ path }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		"aria-label": "Breadcrumb",
		className: "flex min-w-0 items-center gap-1 text-sm",
		children: [path.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-lg font-semibold",
			children: "My Files"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "text-muted-foreground transition-colors hover:text-foreground",
			children: "My Files"
		}), path.map((folder, index) => {
			const last = index === path.length - 1;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex min-w-0 items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-muted-foreground/60" }), last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate font-display text-lg font-semibold",
					children: folder.name
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/folder/$folderId",
					params: { folderId: folder.id },
					className: "truncate text-muted-foreground transition-colors hover:text-foreground",
					children: folder.name
				})]
			}, folder.id);
		})]
	});
}
var ContextMenu = Root2$1;
var ContextMenuTrigger = Trigger;
var ContextMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto h-4 w-4" })]
}));
ContextMenuSubTrigger.displayName = SubTrigger2.displayName;
var ContextMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-context-menu-content-transform-origin)", className),
	...props
}));
ContextMenuSubContent.displayName = SubContent2.displayName;
var ContextMenuContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
	ref,
	className: cn("z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-context-menu-content-transform-origin)", className),
	...props
}) }));
ContextMenuContent.displayName = Content2$1.displayName;
var ContextMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className),
	...props
}));
ContextMenuItem.displayName = Item2.displayName;
var ContextMenuCheckboxItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
ContextMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var ContextMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-4 w-4 fill-current" }) })
	}), children]
}));
ContextMenuRadioItem.displayName = RadioItem2.displayName;
var ContextMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className),
	...props
}));
ContextMenuLabel.displayName = Label2.displayName;
var ContextMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-border", className),
	...props
}));
ContextMenuSeparator.displayName = Separator2.displayName;
var ContextMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";
function ItemMenu({ actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			"aria-label": "Item actions",
			className: "size-8 text-muted-foreground",
			onClick: (e) => e.stopPropagation(),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-44",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: actions.onRename,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PencilLine, { className: "size-4" }), " Rename"]
			}),
			actions.onDownload && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: actions.onDownload,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Download"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: actions.onDelete,
				className: "text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Delete"]
			})
		]
	})] });
}
function ItemContextMenu({ actions, children, asChild = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuTrigger, {
		asChild,
		children
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuContent, {
		className: "w-44",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
				onSelect: actions.onRename,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PencilLine, { className: "size-4" }), " Rename"]
			}),
			actions.onDownload && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
				onSelect: actions.onDownload,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Download"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuItem, {
				onSelect: actions.onDelete,
				className: "text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Delete"]
			})
		]
	})] });
}
function FileList({ folders, files, folderActions, fileActions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden grid-cols-[minmax(0,1fr)_6rem_7rem_8rem_3rem] items-center gap-3 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Name" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Size" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Type" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Modified" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "divide-y divide-border",
			children: [folders.map((folder) => {
				const actions = folderActions(folder);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemContextMenu, {
					actions,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-secondary/60 sm:grid-cols-[minmax(0,1fr)_6rem_7rem_8rem_3rem]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/folder/$folderId",
								params: { folderId: folder.id },
								className: "flex min-w-0 items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "size-4.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate text-sm font-medium",
									children: folder.name
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-sm text-muted-foreground sm:block",
								children: "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-sm text-muted-foreground sm:block",
								children: "Folder"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-sm text-muted-foreground sm:block",
								children: formatDate(folder.created_at)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "justify-self-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemMenu, { actions })
							})
						]
					})
				}, folder.id);
			}), files.map((file) => {
				const kind = fileKind(file.mime_type, file.name);
				const Icon = kindIcon[kind];
				const actions = fileActions(file);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemContextMenu, {
					actions,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-secondary/60 sm:grid-cols-[minmax(0,1fr)_6rem_7rem_8rem_3rem]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-4.5 shrink-0", kindColor[kind]) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate text-sm",
									children: file.name
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-sm text-muted-foreground sm:block",
								children: formatBytes(file.size_bytes)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-sm text-muted-foreground sm:block",
								children: kindLabel[kind]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-sm text-muted-foreground sm:block",
								children: formatDate(file.updated_at)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "justify-self-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemMenu, { actions })
							})
						]
					})
				}, file.id);
			})]
		})]
	});
}
function FileGrid({ folders, files, folderActions, fileActions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
		children: [folders.map((folder) => {
			const actions = folderActions(folder);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemContextMenu, {
				actions,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "group relative rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemMenu, { actions })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/folder/$folderId",
						params: { folderId: folder.id },
						className: "block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "size-8 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 truncate text-sm font-medium",
								children: folder.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: "Folder"
							})
						]
					})]
				})
			}, folder.id);
		}), files.map((file) => {
			const kind = fileKind(file.mime_type, file.name);
			const Icon = kindIcon[kind];
			const actions = fileActions(file);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemContextMenu, {
				actions,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "group relative rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemMenu, { actions })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-8", kindColor[kind]) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 truncate text-sm",
							children: file.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: formatBytes(file.size_bytes)
						})
					]
				})
			}, file.id);
		})]
	});
}
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = Root.displayName;
var UploadContext = (0, import_react.createContext)(null);
function UploadProvider({ children }) {
	const [tasks, setTasks] = (0, import_react.useState)([]);
	const queryClient = useQueryClient();
	const update = (0, import_react.useCallback)((id, patch) => {
		setTasks((prev) => prev.map((t) => t.id === id ? {
			...t,
			...patch
		} : t));
	}, []);
	const startUploads = (0, import_react.useCallback)((files, folderId) => {
		files.forEach((file) => {
			const taskId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
			setTasks((prev) => [...prev, {
				id: taskId,
				name: file.name,
				percent: 0,
				status: "uploading"
			}]);
			(async () => {
				try {
					const ticket = await requestUploadUrl({
						filename: file.name,
						mime_type: file.type,
						size_bytes: file.size,
						folder_id: folderId
					});
					await uploadToUrl(ticket.upload_url, file, (percent) => update(taskId, { percent }));
					await confirmUpload(ticket.file_id);
					update(taskId, {
						percent: 100,
						status: "done"
					});
					queryClient.invalidateQueries({ queryKey: ["folder-contents", folderId] });
				} catch (error) {
					handleApiError(error);
					update(taskId, {
						status: "error",
						error: error instanceof Error ? error.message : "Upload failed"
					});
				}
			})();
		});
	}, [queryClient, update]);
	const dismiss = (0, import_react.useCallback)((id) => {
		setTasks((prev) => prev.filter((t) => t.id !== id));
	}, []);
	const clearFinished = (0, import_react.useCallback)(() => {
		setTasks((prev) => prev.filter((t) => t.status === "uploading"));
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		tasks,
		startUploads,
		dismiss,
		clearFinished
	}), [
		tasks,
		startUploads,
		dismiss,
		clearFinished
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadContext.Provider, {
		value,
		children
	});
}
function useUploads() {
	const ctx = (0, import_react.useContext)(UploadContext);
	if (!ctx) throw new Error("useUploads must be used inside UploadProvider");
	return ctx;
}
function UploadPanel() {
	const { tasks, dismiss, clearFinished } = useUploads();
	if (tasks.length === 0) return null;
	const active = tasks.filter((t) => t.status === "uploading").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed bottom-4 right-4 z-50 w-[19rem] overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-lift)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b border-border px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: active > 0 ? `Uploading ${active} file${active > 1 ? "s" : ""}` : "Uploads complete"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				className: "h-7 px-2 text-xs",
				onClick: clearFinished,
				children: "Clear"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "max-h-60 divide-y divide-border overflow-y-auto",
			children: tasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "px-3 py-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							task.status === "uploading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 shrink-0 animate-spin text-muted-foreground" }),
							task.status === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 shrink-0 text-primary" }),
							task.status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 shrink-0 text-destructive" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 truncate text-sm",
								children: task.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: task.status === "error" ? "Failed" : `${task.percent}%`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"aria-label": "Dismiss",
								onClick: () => dismiss(task.id),
								className: "text-muted-foreground transition-colors hover:text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
							})
						]
					}),
					task.status === "uploading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: task.percent,
						className: "mt-2 h-1"
					}),
					task.status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-destructive",
						children: task.error
					})
				]
			}, task.id))
		})]
	});
}
function FileBrowser({ folderId }) {
	const { user, signOut } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { startUploads } = useUploads();
	const [view, setView] = (0, import_react.useState)("list");
	const [query, setQuery] = (0, import_react.useState)("");
	const [mobileNav, setMobileNav] = (0, import_react.useState)(false);
	const [theme, setTheme] = (0, import_react.useState)("light");
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [newFolderOpen, setNewFolderOpen] = (0, import_react.useState)(false);
	const [newFolderName, setNewFolderName] = (0, import_react.useState)("");
	const [renameTarget, setRenameTarget] = (0, import_react.useState)(null);
	const [renameValue, setRenameValue] = (0, import_react.useState)("");
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const dragDepth = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const stored = getStoredTheme();
		setTheme(stored);
		applyTheme(stored);
	}, []);
	(0, import_react.useEffect)(() => setQuery(""), [folderId]);
	const treeQuery = useQuery({
		queryKey: ["folder-tree"],
		queryFn: getFolderTree
	});
	const contentsQuery = useQuery({
		queryKey: ["folder-contents", folderId],
		queryFn: () => getFolderContents(folderId)
	});
	(0, import_react.useEffect)(() => {
		if (treeQuery.error) handleApiError(treeQuery.error);
		if (contentsQuery.error) handleApiError(contentsQuery.error);
	}, [treeQuery.error, contentsQuery.error]);
	const tree = (0, import_react.useMemo)(() => buildTree(treeQuery.data ?? []), [treeQuery.data]);
	const path = (0, import_react.useMemo)(() => folderPath(treeQuery.data ?? [], folderId), [treeQuery.data, folderId]);
	const ancestorIds = (0, import_react.useMemo)(() => path.map((f) => f.id), [path]);
	const needle = query.trim().toLowerCase();
	const folders = (contentsQuery.data?.folders ?? []).filter((f) => f.name.toLowerCase().includes(needle));
	const files = (contentsQuery.data?.files ?? []).filter((f) => f.name.toLowerCase().includes(needle));
	function refresh() {
		queryClient.invalidateQueries({ queryKey: ["folder-tree"] });
		queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
	}
	function fail(error, fallback) {
		handleApiError(error);
		toast.error(error instanceof Error ? error.message : fallback);
	}
	const createFolder$1 = useMutation({
		mutationFn: (name) => createFolder(name, folderId),
		onSuccess: (folder) => {
			refresh();
			setNewFolderOpen(false);
			setNewFolderName("");
			toast.success(`Created “${folder.name}”`);
		},
		onError: (error) => fail(error, "Could not create the folder.")
	});
	const rename = useMutation({
		mutationFn: async ({ target, name }) => {
			if (target.kind === "folder") await renameFolder(target.item.id, name);
			else await renameFile(target.item.id, name);
		},
		onSuccess: () => {
			refresh();
			setRenameTarget(null);
			toast.success("Renamed");
		},
		onError: (error) => fail(error, "Could not rename.")
	});
	const remove = useMutation({
		mutationFn: (target) => target.kind === "folder" ? deleteFolder(target.item.id) : deleteFile(target.item.id),
		onSuccess: (_data, target) => {
			refresh();
			setDeleteTarget(null);
			toast.success("Deleted");
			if (target.kind === "folder" && ancestorIds.includes(target.item.id)) navigate({ to: "/" });
		},
		onError: (error) => fail(error, "Could not delete.")
	});
	async function download(file) {
		try {
			const { download_url } = await getDownloadUrl(file.id);
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
	const folderActions = (folder) => ({
		onRename: () => {
			setRenameTarget({
				kind: "folder",
				item: folder
			});
			setRenameValue(folder.name);
		},
		onDelete: () => setDeleteTarget({
			kind: "folder",
			item: folder
		})
	});
	const fileActions = (file) => ({
		onRename: () => {
			setRenameTarget({
				kind: "file",
				item: file
			});
			setRenameValue(file.name);
		},
		onDelete: () => setDeleteTarget({
			kind: "file",
			item: file
		}),
		onDownload: () => void download(file)
	});
	function handleSignOut() {
		queryClient.cancelQueries();
		queryClient.clear();
		signOut();
		navigate({
			to: "/login",
			replace: true
		});
	}
	function toggleTheme() {
		const next = theme === "dark" ? "light" : "dark";
		setTheme(next);
		applyTheme(next);
	}
	const sidebar = (onNavigate) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
		tree,
		loading: treeQuery.isLoading,
		activeFolderId: folderId,
		ancestorIds,
		email: user?.email ?? "",
		theme,
		onToggleTheme: toggleTheme,
		onSignOut: handleSignOut,
		onNewFolder: () => {
			onNavigate?.();
			setNewFolderOpen(true);
		},
		onUpload: () => {
			onNavigate?.();
			fileInputRef.current?.click();
		},
		onNavigate
	});
	const isEmpty = !contentsQuery.isLoading && folders.length === 0 && files.length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen w-full bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "hidden w-64 shrink-0 border-r border-sidebar-border md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sticky top-0 h-screen",
					children: sidebar()
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: mobileNav,
				onOpenChange: setMobileNav,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
					side: "left",
					className: "w-72 p-0",
					children: sidebar(() => setMobileNav(false))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative min-w-0 flex-1",
				onDragEnter: (e) => {
					if (!e.dataTransfer.types.includes("Files")) return;
					dragDepth.current += 1;
					setDragging(true);
				},
				onDragOver: (e) => e.preventDefault(),
				onDragLeave: () => {
					dragDepth.current = Math.max(0, dragDepth.current - 1);
					if (dragDepth.current === 0) setDragging(false);
				},
				onDrop: (e) => {
					e.preventDefault();
					dragDepth.current = 0;
					setDragging(false);
					const dropped = Array.from(e.dataTransfer.files);
					if (dropped.length > 0) startUploads(dropped, folderId);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "md:hidden",
								"aria-label": "Open navigation",
								onClick: () => setMobileNav(true),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-0 flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumbs, { path })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full sm:w-56",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: query,
									onChange: (e) => setQuery(e.target.value),
									placeholder: "Search this folder",
									className: "pl-9"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center rounded-lg border border-border p-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "List view",
									onClick: () => setView("list"),
									className: cn("size-8", view === "list" && "bg-accent text-accent-foreground"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Grid view",
									onClick: () => setView("grid"),
									className: cn("size-8", view === "grid" && "bg-accent text-accent-foreground"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-4" })
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-4 py-6 md:px-6",
						children: contentsQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full rounded-xl" }, i))
						}) : contentsQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-card p-10 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg font-semibold",
									children: "This folder didn’t load"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Check your connection and try again."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "mt-4",
									onClick: () => void contentsQuery.refetch(),
									children: "Try again"
								})
							]
						}) : isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-dashed border-border bg-card/60 p-12 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "mx-auto size-8 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 font-display text-lg font-semibold",
									children: needle ? "Nothing matches that search" : "This folder is empty"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: needle ? "Try a different name." : "Drop files here or use New to add something."
								})
							]
						}) : view === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileList, {
							folders,
							files,
							folderActions,
							fileActions
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileGrid, {
							folders,
							files,
							folderActions,
							fileActions
						})
					}),
					dragging && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-primary/10 p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border-2 border-dashed border-primary bg-card px-8 py-6 text-center shadow-[var(--shadow-lift)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "mx-auto size-8 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 font-display text-lg font-semibold",
									children: "Drop to upload"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: ["Files land in ", path.at(-1)?.name ?? "My Files"]
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileInputRef,
				type: "file",
				multiple: true,
				className: "hidden",
				onChange: (e) => {
					const picked = Array.from(e.target.files ?? []);
					if (picked.length > 0) startUploads(picked, folderId);
					e.target.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: newFolderOpen,
				onOpenChange: setNewFolderOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New folder" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
						"Created in ",
						path.at(-1)?.name ?? "My Files",
						"."
					] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "folder-name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "folder-name",
							value: newFolderName,
							onChange: (e) => setNewFolderName(e.target.value),
							placeholder: "Untitled folder",
							autoFocus: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setNewFolderOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: newFolderName.trim().length === 0 || createFolder$1.isPending,
						onClick: () => createFolder$1.mutate(newFolderName),
						children: "Create"
					})] })
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: renameTarget !== null,
				onOpenChange: (open) => !open && setRenameTarget(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Rename ", renameTarget?.kind === "folder" ? "folder" : "file"] }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "rename-value",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "rename-value",
							value: renameValue,
							onChange: (e) => setRenameValue(e.target.value),
							autoFocus: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setRenameTarget(null),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: renameValue.trim().length === 0 || rename.isPending,
						onClick: () => renameTarget && rename.mutate({
							target: renameTarget,
							name: renameValue
						}),
						children: "Save"
					})] })
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: deleteTarget !== null,
				onOpenChange: (open) => !open && setDeleteTarget(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
					"Delete “",
					deleteTarget?.item.name,
					"”?"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: deleteTarget?.kind === "folder" ? "Everything inside this folder, including subfolders and their files, is removed too. This cannot be undone." : "This file is removed permanently and cannot be recovered." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: () => deleteTarget && remove.mutate(deleteTarget),
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					children: "Delete"
				})] })] })
			})
		]
	});
}
function RequireAuth({ children }) {
	const { token, ready } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (ready && !token) navigate({
			to: "/login",
			replace: true
		});
	}, [
		ready,
		token,
		navigate
	]);
	if (!ready || !token) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-xl font-semibold text-muted-foreground",
			children: "Stash"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadProvider, { children });
}
//#endregion
export { RequireAuth as n, FileBrowser as t };
