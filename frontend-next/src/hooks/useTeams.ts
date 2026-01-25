import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

export interface Team {
  id: string;
  name: string;
  role: 'OWNER' | 'MEMBER';
  createdAt: string;
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/teams');
      // Axios stores the JSON body in 'data'
      const data = response.data;
      setTeams(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch teams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTeam = async (name: string) => {
    try {
      const response = await api.post('/teams', { name });
      await fetchTeams(); // Refresh list after creation
      return { success: true, data: response.data };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to create team',
      };
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      await api.delete(`/teams/${id}`);
      setTeams((prev) => prev.filter((t) => t.id !== id));
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to delete team',
      };
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    isLoading,
    error,
    createTeam,
    deleteTeam,
    refresh: fetchTeams,
  };
}
