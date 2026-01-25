'use client';

import { useState } from 'react';
import { Users, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { cn } from '@/lib/utils';

export default function TeamsPage() {
  const { teams, isLoading, error, createTeam, deleteTeam } = useTeams();
  const [newTeamName, setNewTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setIsSubmitting(true);
    const result = await createTeam(newTeamName);
    if (result.success) {
      setNewTeamName('');
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="text-blue-600" />
          My Teams
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Create Team Form */}
      <form onSubmit={handleCreate} className="mb-10 flex gap-3">
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="Enter team name..."
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newTeamName.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Plus size={18} />
          )}
          Create Team
        </button>
      </form>

      {/* Teams List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-32 bg-slate-50 animate-pulse rounded-xl border border-slate-100"
            />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
          <Users className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-900">No teams found</h3>
          <p className="text-slate-500">
            Create your first team to start collaborating.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="group p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {team.name}
                  </h3>
                  <span
                    className={cn(
                      'inline-block mt-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded',
                      team.role === 'OWNER'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-50 text-slate-600',
                    )}
                  >
                    {team.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this team?'))
                      deleteTeam(team.id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
