// src/app/dashboard/projects/page.tsx
'use client';

import { FolderKanban, Plus } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm">
            Manage and track your team's initiatives.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* English: Placeholder for the project list we'll fetch from the backend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 bg-white">
          <FolderKanban size={48} className="mb-4 opacity-20" />
          <p className="font-medium">No projects found</p>
          <p className="text-xs">Click "New Project" to get started.</p>
        </div>
      </div>
    </div>
  );
}
