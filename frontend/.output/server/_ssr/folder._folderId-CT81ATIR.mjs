import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Route } from "./folder._folderId-C-adFWio.mjs";
import { n as RequireAuth, t as FileBrowser } from "./RequireAuth-C3PB4HtV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/folder._folderId-CT81ATIR.js
var import_jsx_runtime = require_jsx_runtime();
function FolderRoute() {
	const { folderId } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileBrowser, { folderId }) });
}
//#endregion
export { FolderRoute as component };
