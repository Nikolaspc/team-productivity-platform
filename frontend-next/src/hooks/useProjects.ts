import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

export interface Project {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  createdAt: string;
}

export function useProjects(teamId: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!teamId) {
      setProjects([]);
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.get(`/teams/${teamId}/projects`);
      // Axios stores the response body in .data
      setProjects(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  const createProject = async (name: string) => {
    if (!teamId) return { success: false, error: 'No team selected' };
    try {
      const response = await api.post(`/teams/${teamId}/projects`, { name });
      await fetchProjects();
      return { success: true, data: response.data };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to create project',
      };
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!teamId) return;
    try {
      await api.delete(`/teams/${teamId}/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to delete project',
      };
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, isLoading, error, createProject, deleteProject };
}
