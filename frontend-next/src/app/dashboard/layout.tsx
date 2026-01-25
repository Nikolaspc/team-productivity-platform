// src/app/(dashboard)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { UserNav } from '@/components/layout/UserNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* English: Persistent Sidebar for internal navigation */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-6">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Team<span className="text-blue-600">Flow</span>
          </span>
        </div>

        <div className="flex-1 px-4">
          <Sidebar />
        </div>

        <div className="p-4 border-t border-slate-100">
          <UserNav />
        </div>
      </aside>

      {/* English: Main Content Area where dashboard views are rendered */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center px-8 sticky top-0 z-10">
          <h1 className="text-sm font-medium text-slate-500">
            Workspace / Dashboard
          </h1>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
