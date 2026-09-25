export interface User {
  id: string;
  email: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface FileItem {
  id: string;
  name: string;
  folder_id: string | null;
  size_bytes: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UploadTicket {
  file_id: string;
  upload_url: string;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const TOKEN_KEY = "stash.token";
const USER_KEY = "stash.user";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const isBrowser = () => typeof window !== "undefined";

export function getToken(): string | null {
  return isBrowser() ? window.localStorage.getItem(TOKEN_KEY) : null;
}

export function getStoredUser(): User | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function setSession(token: string, user: User): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function requireAuth(): void {
  if (!getToken()) throw new ApiError(401, "Unauthorized");
}

async function fetchApi(path: string, options: RequestInit = {}) {
  const headers = { ...authHeaders(), ...(options.headers || {}) };
  // If sending FormData, do not set Content-Type header so browser sets multipart/form-data boundary
  if (options.body instanceof FormData && (headers as any)["Content-Type"]) {
    delete (headers as any)["Content-Type"];
  } else if (!options.body || typeof options.body === "string") {
      headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  
  if (!res.ok) {
    let message = "An error occurred";
    try {
      const data = await res.json();
      message = data.detail || message;
    } catch (e) {}
    throw new ApiError(res.status, message);
  }
  
  // Return null for 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

/* ---------- auth ---------- */

export async function register(email: string, password: string): Promise<AuthResponse> {
  const user = await fetchApi("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  const tokenData = await fetchApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  const authRes: AuthResponse = { token: tokenData.access_token, user: { id: user.id, email: user.email } };
  setSession(authRes.token, authRes.user);
  return authRes;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const tokenData = await fetchApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  // Fetch user details
  const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  if (!res.ok) throw new ApiError(401, "Failed to get user details");
  const user = await res.json();
  
  const authRes: AuthResponse = { token: tokenData.access_token, user: { id: user.id, email: user.email } };
  setSession(authRes.token, authRes.user);
  return authRes;
}

export async function logout(): Promise<void> {
  clearSession();
}

/* ---------- browsing ---------- */

export async function getFolderContents(
  folderId: string | null,
): Promise<{ folders: Folder[]; files: FileItem[] }> {
  requireAuth();
  
  const [allFolders, files] = await Promise.all([
    fetchApi("/folders"),
    fetchApi(`/files${folderId ? `?folder_id=${folderId}` : ''}`)
  ]);
  
  const folders = allFolders.filter((f: Folder) => f.parent_id === folderId);
  return { folders, files };
}

export async function getFolderTree(): Promise<Folder[]> {
  requireAuth();
  return fetchApi("/folders");
}

export async function createFolder(name: string, parentId: string | null): Promise<Folder> {
  requireAuth();
  return fetchApi("/folders", {
    method: "POST",
    body: JSON.stringify({ name, parent_id: parentId }),
  });
}

export async function renameFolder(id: string, name: string): Promise<Folder> {
  requireAuth();
  return fetchApi(`/folders/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function deleteFolder(id: string): Promise<void> {
  requireAuth();
  await fetchApi(`/folders/${id}`, { method: "DELETE" });
}

export async function renameFile(id: string, name: string): Promise<FileItem> {
  requireAuth();
  return fetchApi(`/files/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function deleteFile(id: string): Promise<void> {
  requireAuth();
  await fetchApi(`/files/${id}`, { method: "DELETE" });
}

/* ---------- upload / download ---------- */

export async function requestUploadUrl(input: {
  filename: string;
  mime_type: string;
  size_bytes: number;
  folder_id: string | null;
}): Promise<UploadTicket> {
  requireAuth();
  // We don't actually need a presigned URL, we will just POST directly in uploadToUrl.
  // We encode the folder_id inside the upload_url so uploadToUrl has access to it.
  const payload = JSON.stringify({ folder_id: input.folder_id });
  return { file_id: "pending", upload_url: `local-upload:${payload}` };
}

export function uploadToUrl(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let folderId = null;
    if (uploadUrl.startsWith("local-upload:")) {
        try {
            const data = JSON.parse(uploadUrl.replace("local-upload:", ""));
            folderId = data.folder_id;
        } catch(e) {}
    }
      
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folder_id", folderId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/files/upload`, true);
    
    // Add auth header manually
    const token = getToken();
    if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new ApiError(xhr.status, "Upload failed."));
    xhr.onerror = () => reject(new ApiError(0, "Upload failed."));
    
    // Do NOT set Content-Type header, XMLHttpRequest handles multipart boundary automatically
    xhr.send(formData);
  });
}

export async function confirmUpload(fileId: string): Promise<FileItem> {
  requireAuth();
  // Upload is already complete via our 1-step direct POST to backend.
  // We just return a dummy FileItem so the UI doesn't crash. (The UI re-fetches the folder contents anyway).
  return {
      id: "dummy", name: "dummy", folder_id: null, size_bytes: 0, mime_type: "", created_at: "", updated_at: ""
  };
}

export async function getDownloadUrl(fileId: string): Promise<{ download_url: string }> {
  requireAuth();
  return fetchApi(`/files/${fileId}/download`);
}
