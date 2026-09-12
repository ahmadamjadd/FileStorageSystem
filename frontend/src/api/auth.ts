import apiClient from './client';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  // Register a new user
  register: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post('/api/auth/register', { email, password });
    return response.data;
  },

  // Login and get JWT token
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  // Get current user profile (using JWT token)
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};
