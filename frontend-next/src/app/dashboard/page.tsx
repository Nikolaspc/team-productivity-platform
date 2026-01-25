'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useTeams } from '@/hooks/useTeams';
import { useProjects } from '@/hooks/useProjects';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Users,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  // English: Access user from global store
  const user = useAuthStore((state) => state.user);

  // English: Fetch real data from our hooks
  const { teams, isLoading: loadingTeams } = useTeams();

  // English: Fetch projects for the first available team as a dashboard summary
  const firstTeamId = teams.length > 0 ? teams[0].id : null;
  const { projects, isLoading: loadingProjects } = useProjects(firstTeamId);

  // English: Dynamic stats based on real API data
  const stats = [
    {
      label: 'Active Teams',
      value: loadingTeams ? '...' : teams.length.toString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Projects',
      value: loadingProjects ? '...' : projects.length.toString(),
      icon: LayoutDashboard,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Tasks Done',
      value: '0', // English: Placeholder until Global Task Hook is implemented
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Pending Actions',
      value: '0',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-slate-500 mt-1">
            Here is what is happening across your workspace today.
          </p>
        </div>

        {/* English: Simple Role Indicator */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Access Level
          </span>
          <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-bold mt-1">
            {user?.role || 'MEMBER'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {(loadingTeams || loadingProjects) && stat.value === '...' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 leading-none">
                      {stat.value}
                    </p>
                  )}
                </div>
              </div>
              <div className={cn('p-3 rounded-xl', stat.bg)}>
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* English: Identity & Session Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold opacity-90">Account Status</h3>
              <p className="text-2xl font-bold mt-4 truncate">{user?.email}</p>
              <div className="mt-8 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium opacity-80">
                  Live Session Active
                </span>
              </div>
            </div>
            <Users className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10 rotate-12" />
          </div>
        </div>

        {/* English: Quick Placeholder for Team Activity */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-blue-600" />
            Recent Workspace Activity
          </h3>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="text-slate-300" size={24} />
            </div>
            <p className="text-slate-500 text-sm max-w-xs">
              Activity logging is being processed. New events will appear here
              shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
