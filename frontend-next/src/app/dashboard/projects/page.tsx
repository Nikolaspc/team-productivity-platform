'use client';

import { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Loader2,
  Trash2,
  AlertCircle,
  LayoutGrid,
} from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { useProjects } from '@/hooks/useProjects';

export default function ProjectsPage() {
  const { teams, isLoading: loadingTeams } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const { projects, isLoading, createProject, deleteProject, error } =
    useProjects(selectedTeamId);

  const [projectName, setProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !selectedTeamId) return;

    setIsSubmitting(true);
    const result = await createProject(projectName);
    if (result.success) {
      setProjectName('');
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="text-blue-600" size={24} />
            Projects
          </h1>
          <p className="text-slate-500 text-sm">
            Manage your team's initiatives and workspace.
          </p>
        </div>

        {/* Essential for SaaS: Contextual Team Selection */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">
            Active Team:
          </span>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm min-w-[150px]"
            disabled={loadingTeams}
          >
            <option value="">Select Team...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {selectedTeamId ? (
        <>
          {/* Create Project Section */}
          <form
            onSubmit={handleCreate}
            className="bg-white p-4 border border-slate-200 rounded-xl flex gap-3 shadow-sm"
          >
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name (e.g., Q1 Marketing)"
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !projectName.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium text-sm transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Plus size={16} />
              )}
              New Project
            </button>
          </form>

          {/* Dynamic Project Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-28 bg-slate-50 animate-pulse rounded-xl border border-slate-100"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-slate-400 bg-white">
              <FolderKanban size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-slate-600">
                No projects in this team
              </p>
              <p className="text-xs">
                Create one above to start tracking tasks.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 truncate pr-4">
                      {project.name}
                    </h3>
                    <button
                      onClick={() =>
                        confirm('Are you sure?') && deleteProject(project.id)
                      }
                      className="text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      ID: {project.id.slice(0, 8)}
                    </span>
                    <button className="text-xs text-blue-600 font-semibold hover:underline">
                      View Tasks →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-12 rounded-2xl text-center">
          <FolderKanban className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-700">
            Ready to start?
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            Select a team from the dropdown above to view or create projects.
          </p>
        </div>
      )}
    </div>
  );
}
