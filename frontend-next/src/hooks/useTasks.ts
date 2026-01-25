import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  projectId: string;
}

export function useTasks(projectId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.get(`/tasks/project/${projectId}`);
      setTasks(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const createTask = async (title: string, description?: string) => {
    if (!projectId) return { success: false };
    try {
      const response = await api.post('/tasks', {
        title,
        description,
        projectId,
      });
      await fetchTasks();
      toast.success('Task created successfully');
      return { success: true, data: response.data };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create task';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    const previousTasks = [...tasks];
    // English: Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t)),
    );

    try {
      await api.patch(`/tasks/${taskId}`, { status });
      toast.info(`Status updated to ${status.replace('_', ' ')}`);
    } catch (err: any) {
      setTasks(previousTasks);
      toast.error('Failed to sync status with server');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTaskStatus,
    refresh: fetchTasks,
  };
}
