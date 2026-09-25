import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DVzjrRpl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ApiError = class extends Error {
	status;
	constructor(status, message) {
		super(message);
		this.status = status;
		this.name = "ApiError";
	}
};
var TOKEN_KEY = "stash.token";
var USER_KEY = "stash.user";
var DB_KEY = "stash.db";
var isBrowser = () => typeof window !== "undefined";
var uid = () => Math.random().toString(36).slice(2, 11);
var latency = () => 300 + Math.round(Math.random() * 300);
var wait = (ms = latency()) => new Promise((r) => setTimeout(r, ms));
function daysAgo(n) {
	return (/* @__PURE__ */ new Date(Date.now() - n * 864e5)).toISOString();
}
function seed() {
	const docs = {
		id: "f_docs",
		name: "Documents",
		parent_id: null,
		created_at: daysAgo(40)
	};
	const contracts = {
		id: "f_contracts",
		name: "Contracts",
		parent_id: docs.id,
		created_at: daysAgo(30)
	};
	const photos = {
		id: "f_photos",
		name: "Photos",
		parent_id: null,
		created_at: daysAgo(22)
	};
	const code = {
		id: "f_code",
		name: "Projects",
		parent_id: null,
		created_at: daysAgo(12)
	};
	const mk = (id, name, folder_id, size_bytes, mime_type, age) => ({
		id,
		name,
		folder_id,
		size_bytes,
		mime_type,
		created_at: daysAgo(age + 2),
		updated_at: daysAgo(age)
	});
	return {
		users: [{
			id: "u_demo",
			email: "demo@stash.app",
			password: "password"
		}],
		folders: [
			docs,
			contracts,
			photos,
			code
		],
		files: [
			mk("i_1", "Welcome to Stash.pdf", null, 184320, "application/pdf", 1),
			mk("i_2", "Quarterly notes.docx", null, 42118, "application/msword", 3),
			mk("i_3", "Invoice-2091.pdf", docs.id, 96400, "application/pdf", 5),
			mk("i_4", "Studio lease.pdf", contracts.id, 231e3, "application/pdf", 9),
			mk("i_5", "atrium-light.jpg", photos.id, 2418e3, "image/jpeg", 4),
			mk("i_6", "desk-setup.png", photos.id, 1204e3, "image/png", 6),
			mk("i_7", "server.ts", code.id, 8240, "text/typescript", 2),
			mk("i_8", "archive-2024.zip", code.id, 1894e4, "application/zip", 15)
		],
		pending: {}
	};
}
function readDb() {
	if (!isBrowser()) return seed();
	const raw = window.localStorage.getItem(DB_KEY);
	if (!raw) {
		const fresh = seed();
		window.localStorage.setItem(DB_KEY, JSON.stringify(fresh));
		return fresh;
	}
	try {
		return JSON.parse(raw);
	} catch {
		const fresh = seed();
		window.localStorage.setItem(DB_KEY, JSON.stringify(fresh));
		return fresh;
	}
}
function writeDb(db) {
	if (!isBrowser()) return;
	window.localStorage.setItem(DB_KEY, JSON.stringify(db));
}
function getToken() {
	return isBrowser() ? window.localStorage.getItem(TOKEN_KEY) : null;
}
function getStoredUser() {
	if (!isBrowser()) return null;
	const raw = window.localStorage.getItem(USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function setSession(token, user) {
	if (!isBrowser()) return;
	window.localStorage.setItem(TOKEN_KEY, token);
	window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function clearSession() {
	if (!isBrowser()) return;
	window.localStorage.removeItem(TOKEN_KEY);
	window.localStorage.removeItem(USER_KEY);
}
function requireAuth() {
	if (!getToken()) throw new ApiError(401, "Unauthorized");
}
async function register(email, password) {
	await wait();
	const db = readDb();
	const normalized = email.trim().toLowerCase();
	if (db.users.some((u) => u.email === normalized)) throw new ApiError(409, "An account with that email already exists.");
	const user = {
		id: `u_${uid()}`,
		email: normalized
	};
	db.users.push({
		...user,
		password
	});
	writeDb(db);
	const token = `mock.${uid()}`;
	setSession(token, user);
	return {
		token,
		user
	};
}
async function login(email, password) {
	await wait();
	const db = readDb();
	const normalized = email.trim().toLowerCase();
	const found = db.users.find((u) => u.email === normalized && u.password === password);
	if (!found) throw new ApiError(401, "Incorrect email or password.");
	const user = {
		id: found.id,
		email: found.email
	};
	const token = `mock.${uid()}`;
	setSession(token, user);
	return {
		token,
		user
	};
}
async function getFolderContents(folderId) {
	requireAuth();
	await wait();
	const db = readDb();
	if (folderId && !db.folders.some((f) => f.id === folderId)) throw new ApiError(404, "Folder not found.");
	return {
		folders: db.folders.filter((f) => f.parent_id === folderId).sort((a, b) => a.name.localeCompare(b.name)),
		files: db.files.filter((f) => f.folder_id === folderId).sort((a, b) => a.name.localeCompare(b.name))
	};
}
async function getFolderTree() {
	requireAuth();
	await wait(200);
	return readDb().folders;
}
async function createFolder(name, parentId) {
	requireAuth();
	await wait();
	const db = readDb();
	const folder = {
		id: `f_${uid()}`,
		name: name.trim(),
		parent_id: parentId,
		created_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	db.folders.push(folder);
	writeDb(db);
	return folder;
}
async function renameFolder(id, name) {
	requireAuth();
	await wait();
	const db = readDb();
	const folder = db.folders.find((f) => f.id === id);
	if (!folder) throw new ApiError(404, "Folder not found.");
	folder.name = name.trim();
	writeDb(db);
	return folder;
}
async function deleteFolder(id) {
	requireAuth();
	await wait();
	const db = readDb();
	const doomed = /* @__PURE__ */ new Set([id]);
	let grew = true;
	while (grew) {
		grew = false;
		for (const f of db.folders) if (f.parent_id && doomed.has(f.parent_id) && !doomed.has(f.id)) {
			doomed.add(f.id);
			grew = true;
		}
	}
	db.folders = db.folders.filter((f) => !doomed.has(f.id));
	db.files = db.files.filter((f) => !(f.folder_id && doomed.has(f.folder_id)));
	writeDb(db);
}
async function renameFile(id, name) {
	requireAuth();
	await wait();
	const db = readDb();
	const file = db.files.find((f) => f.id === id);
	if (!file) throw new ApiError(404, "File not found.");
	file.name = name.trim();
	file.updated_at = (/* @__PURE__ */ new Date()).toISOString();
	writeDb(db);
	return file;
}
async function deleteFile(id) {
	requireAuth();
	await wait();
	const db = readDb();
	db.files = db.files.filter((f) => f.id !== id);
	writeDb(db);
}
async function requestUploadUrl(input) {
	requireAuth();
	await wait(250);
	const db = readDb();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const file = {
		id: `i_${uid()}`,
		name: input.filename,
		folder_id: input.folder_id,
		size_bytes: input.size_bytes,
		mime_type: input.mime_type || "application/octet-stream",
		created_at: now,
		updated_at: now
	};
	db.pending[file.id] = file;
	writeDb(db);
	return {
		file_id: file.id,
		upload_url: `mock://storage/${file.id}`
	};
}
/**
* Real mode: XMLHttpRequest PUT straight to storage so progress events work.
* Mock mode: simulated progress, bytes never touch our own API either way.
*/
function uploadToUrl(uploadUrl, file, onProgress) {
	if (uploadUrl.startsWith("mock://")) return new Promise((resolve) => {
		let percent = 0;
		const tick = setInterval(() => {
			percent = Math.min(100, percent + 6 + Math.random() * 14);
			onProgress(Math.round(percent));
			if (percent >= 100) {
				clearInterval(tick);
				resolve();
			}
		}, 120);
	});
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", uploadUrl, true);
		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100));
		};
		xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new ApiError(xhr.status, "Upload failed."));
		xhr.onerror = () => reject(new ApiError(0, "Upload failed."));
		xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
		xhr.send(file);
	});
}
async function confirmUpload(fileId) {
	requireAuth();
	await wait(250);
	const db = readDb();
	const pending = db.pending[fileId];
	if (!pending) throw new ApiError(404, "Upload not found.");
	delete db.pending[fileId];
	db.files.push(pending);
	writeDb(db);
	return pending;
}
async function getDownloadUrl(fileId) {
	requireAuth();
	await wait(250);
	const file = readDb().files.find((f) => f.id === fileId);
	if (!file) throw new ApiError(404, "File not found.");
	const blob = new Blob([`Stash mock contents for ${file.name}`], { type: file.mime_type || "text/plain" });
	return { download_url: URL.createObjectURL(blob) };
}
var AuthContext = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [token, setToken] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setToken(getToken());
		setUser(getStoredUser());
		setReady(true);
		const onUnauthorized = () => {
			setToken(null);
			setUser(null);
		};
		window.addEventListener("stash:unauthorized", onUnauthorized);
		return () => window.removeEventListener("stash:unauthorized", onUnauthorized);
	}, []);
	const signIn = (0, import_react.useCallback)(async (email, password) => {
		const res = await login(email, password);
		setToken(res.token);
		setUser(res.user);
	}, []);
	const signUp = (0, import_react.useCallback)(async (email, password) => {
		const res = await register(email, password);
		setToken(res.token);
		setUser(res.user);
	}, []);
	const signOut = (0, import_react.useCallback)(() => {
		clearSession();
		setToken(null);
		setUser(null);
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		user,
		token,
		ready,
		signIn,
		signUp,
		signOut
	}), [
		user,
		token,
		ready,
		signIn,
		signUp,
		signOut
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}
/** Any 401 from the API layer clears the token and bounces to /login. */
function handleApiError(error) {
	if (error instanceof ApiError && error.status === 401) {
		clearSession();
		if (typeof window !== "undefined") {
			window.dispatchEvent(new Event("stash:unauthorized"));
			if (window.location.pathname !== "/login") window.location.assign("/login");
		}
	}
}
//#endregion
export { deleteFolder as a, getFolderTree as c, renameFolder as d, requestUploadUrl as f, deleteFile as i, handleApiError as l, useAuth as m, confirmUpload as n, getDownloadUrl as o, uploadToUrl as p, createFolder as r, getFolderContents as s, AuthProvider as t, renameFile as u };
