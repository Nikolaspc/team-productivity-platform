'use client';

import { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Layout,
  Filter,
  MoreVertical,
} from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { useProjects } from '@/hooks/useProjects';
import { useTasks, Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

export default function TasksPage() {
  const { teams } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const { projects } = useProjects(selectedTeamId);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const { tasks, isLoading, createTask, updateTaskStatus } =
    useTasks(selectedProjectId);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedProjectId) return;

    setIsCreating(true);
    const result = await createTask(newTaskTitle);
    if (result.success) setNewTaskTitle('');
    setIsCreating(false);
  };

  // English: Column definitions for SaaS Kanban
  const columns: {
    id: Task['status'];
    label: string;
    icon: any;
    color: string;
    border: string;
  }[] = [
    {
      id: 'OPEN',
      label: 'To Do',
      icon: Circle,
      color: 'text-slate-400',
      border: 'border-t-slate-400',
    },
    {
      id: 'IN_PROGRESS',
      label: 'In Progress',
      icon: Clock,
      color: 'text-blue-500',
      border: 'border-t-blue-500',
    },
    {
      id: 'DONE',
      label: 'Completed',
      icon: CheckCircle2,
      color: 'text-green-500',
      border: 'border-t-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="text-blue-600" />
            Project Board
          </h1>
          <p className="text-slate-500 text-sm">
            Track and manage tasks across your teams.
          </p>
        </div>

        {/* Hierarchical Selectors */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedTeamId}
            onChange={(e) => {
              setSelectedTeamId(e.target.value);
              setSelectedProjectId('');
            }}
            className="text-xs font-medium border-slate-200 rounded-lg bg-white p-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Choose Team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={!selectedTeamId}
            className="text-xs font-medium border-slate-200 rounded-lg bg-white p-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
          >
            <option value="">Choose Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedProjectId ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="p-4 bg-slate-50 rounded-full mb-4 text-slate-400">
            <Layout size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Select a project to begin
          </h3>
          <p className="text-slate-500 text-sm">
            Choose a team and project from the menu above.
          </p>
        </div>
      ) : (
        <>
          {/* Quick Input Form */}
          <form
            onSubmit={handleCreateTask}
            className="flex gap-2 max-w-lg bg-white p-2 rounded-2xl border border-slate-200 shadow-sm"
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={isCreating || !newTaskTitle.trim()}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-all"
            >
              {isCreating ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Plus size={16} />
              )}
              Add Task
            </button>
          </form>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {columns.map((col) => (
              <div
                key={col.id}
                className={cn(
                  'flex flex-col bg-slate-100/40 rounded-2xl p-4 border-t-4 shadow-sm min-h-[500px]',
                  col.border,
                )}
              >
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-2">
                    <col.icon size={18} className={col.color} />
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-widest">
                      {col.label}
                    </span>
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-500 border border-slate-200">
                    {tasks.filter((t) => t.status === col.id).length}
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks
                    .filter((t) => t.status === col.id)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group relative"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-medium text-slate-800 leading-snug">
                            {task.title}
                          </h4>
                          <MoreVertical
                            size={14}
                            className="text-slate-300 cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateTaskStatus(task.id, e.target.value as any)
                            }
                            className="text-[10px] font-bold bg-slate-50 border-none rounded-md p-1 text-slate-500 hover:bg-slate-100 transition-all outline-none"
                          >
                            <option value="OPEN">To Do</option>
                            <option value="IN_PROGRESS">Progress</option>
                            <option value="DONE">Done</option>
                          </select>

                          <div
                            className={cn(
                              'px-2 py-0.5 rounded text-[9px] font-bold uppercase',
                              task.priority === 'HIGH'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-blue-50 text-blue-600',
                            )}
                          >
                            {task.priority}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
