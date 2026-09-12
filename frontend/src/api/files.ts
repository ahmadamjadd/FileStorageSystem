import apiClient from './client';

export interface FileData {
  id: string;
  original_filename: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
}

export interface FileUploadResponse {
  message: string;
  file: FileData;
}

export interface FileDownloadResponse {
  download_url: string;
}

export const filesApi = {
  // List all files
  listFiles: async (): Promise<FileData[]> => {
    const response = await apiClient.get('/api/files/');
    return response.data;
  },

  // Upload a file
  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    // We must use FormData for multipart/form-data
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get download URL
  getDownloadUrl: async (fileId: string): Promise<string> => {
    const response = await apiClient.get<FileDownloadResponse>(`/api/files/${fileId}/download`);
    return response.data.download_url;
  },

  // Delete a file
  deleteFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(`/api/files/${fileId}`);
  },
};
