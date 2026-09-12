import { useState, useEffect, useRef } from 'react';
import { LogOut, UploadCloud, File as FileIcon, Trash2, Download, Loader2, FileText, Image as ImageIcon, FileArchive, CheckCircle2, AlertCircle } from 'lucide-react';
import { filesApi, FileData } from '../api/files';
import { authApi, User } from '../api/auth';
import axios from 'axios';

// Utility to format bytes into readable sizes (KB, MB)
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Map content types to lucide icons
function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
  if (contentType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
  if (contentType.includes('zip') || contentType.includes('tar') || contentType.includes('gzip')) return <FileArchive className="w-8 h-8 text-amber-500" />;
  return <FileIcon className="w-8 h-8 text-slate-500" />;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [userData, filesData] = await Promise.all([
        authApi.getMe(),
        filesApi.listFiles()
      ]);
      setUser(userData);
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // If we get a 401, they probably have an expired token
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');
    setIsUploading(true);

    try {
      const response = await filesApi.uploadFile(file);
      // Add the new file to the list directly without re-fetching
      setFiles(prev => [response.file, ...prev]);
      setUploadSuccess('File uploaded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setUploadError(err.response.data.detail || 'Failed to upload file.');
      } else {
        setUploadError('An unexpected error occurred during upload.');
      }
    } finally {
      setIsUploading(false);
      // Reset the file input so they can upload the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const url = await filesApi.getDownloadUrl(fileId);
      // Create an invisible anchor tag to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // This suggests the filename to the browser
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Could not download file. Please try again.');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file? This cannot be undone.')) {
      return;
    }

    try {
      await filesApi.deleteFile(fileId);
      // Remove from UI
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Could not delete file. Please try again.');
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Cloud Storage</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-500 hidden sm:block">{user?.email}</span>
            <button 
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Files</h2>
            <p className="text-slate-500 mt-1">Manage and securely share your stored documents.</p>
          </div>

          {/* Upload Button */}
          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              // We'll leave accept="" off so they can pick anything, but backend validates it
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Uploading...</>
              ) : (
                <><UploadCloud className="w-5 h-5 mr-2" /> Upload File</>
              )}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {uploadError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm font-medium">{uploadError}</p>
          </div>
        )}
        
        {uploadSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm font-medium">{uploadSuccess}</p>
          </div>
        )}

        {/* File List */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-3xl py-24 flex flex-col items-center text-center px-4">
            <div className="bg-indigo-50 p-4 rounded-full mb-4">
              <UploadCloud className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No files uploaded yet</h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Get started by uploading your first document, image, or presentation to the cloud.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
            >
              Click to upload a file
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {files.map((file) => (
                <li key={file.id} className="p-4 hover:bg-slate-50 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* File Info */}
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-2 bg-slate-100 rounded-xl flex-shrink-0">
                      {getFileIcon(file.content_type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate" title={file.original_filename}>
                        {file.original_filename}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-slate-500">
                          {formatBytes(file.file_size)}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-xs text-slate-400">
                          {new Date(file.uploaded_at).toLocaleDateString(undefined, { 
                            year: 'numeric', month: 'short', day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownload(file.id, file.original_filename)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2 flex-1 justify-center sm:flex-none"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-xs font-medium sm:hidden">Download</span>
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 flex-1 justify-center sm:flex-none"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs font-medium sm:hidden">Delete</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
