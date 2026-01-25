// src/app/dashboard/teams/page.tsx
'use client';

import { Users } from 'lucide-react';

export default function TeamsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <Users className="text-blue-600" />
        My Teams
      </h1>
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-12 text-center">
        <p className="text-slate-500 font-medium">
          Team management module coming soon.
        </p>
      </div>
    </div>
  );
}
