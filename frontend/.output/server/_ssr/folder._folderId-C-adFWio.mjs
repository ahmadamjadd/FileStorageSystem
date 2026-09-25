import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/folder._folderId-C-adFWio.js
var $$splitComponentImporter = () => import("./folder._folderId-CT81ATIR.mjs");
var Route = createFileRoute("/folder/$folderId")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Folder — Stash" },
		{
			name: "description",
			content: "Browse the files and subfolders inside this Stash folder."
		},
		{
			property: "og:title",
			content: "Folder — Stash"
		},
		{
			property: "og:description",
			content: "Browse the files and subfolders inside this Stash folder."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
