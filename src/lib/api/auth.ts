import { apiClient } from "./client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  modules: {
    freelance: boolean;
    household: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  modules: {
    freelance: boolean;
    household: boolean;
  };
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    return apiClient.post<AuthResponse>("/api/auth/login", credentials);
  },

  register: async (data: RegisterData) => {
    return apiClient.post<AuthResponse>("/api/auth/register", data);
  },

  logout: async () => {
    return apiClient.post<{ success: boolean }>("/api/auth/logout");
  },

  getSession: async () => {
    return apiClient.get<{ user: User }>("/api/auth/session");
  },
};

