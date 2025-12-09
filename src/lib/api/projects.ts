import { apiClient } from "./client";
import { Project } from "@/app/projects/types";

export const projectsApi = {
  // Get all projects
  getAll: async (): Promise<{ data: Project[] | null; error: string | null }> => {
    const response = await apiClient.get<{ projects: Project[] }>("/api/projects");
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.projects || [], error: null };
  },

  // Get single project
  getById: async (id: string): Promise<{ data: Project | null; error: string | null }> => {
    const response = await apiClient.get<{ project: Project }>(`/api/projects/${id}`);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.project || null, error: null };
  },

  // Create project
  create: async (project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<{ data: Project | null; error: string | null }> => {
    const response = await apiClient.post<{ project: Project }>("/api/projects", project);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.project || null, error: null };
  },

  // Update project
  update: async (id: string, project: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>): Promise<{ data: Project | null; error: string | null }> => {
    const response = await apiClient.patch<{ project: Project }>(`/api/projects/${id}`, project);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.project || null, error: null };
  },

  // Delete project
  delete: async (id: string): Promise<{ error: string | null }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/projects/${id}`);
    if (response.error) {
      return { error: response.error };
    }
    return { error: null };
  },
};

