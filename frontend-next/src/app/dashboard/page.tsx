'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { LayoutDashboard, CheckCircle2, Clock, Users } from 'lucide-react';

export default function DashboardPage() {
  // English: Accessing user data from global state
  const user = useAuthStore((state) => state.user);

  // English: Mock stats - We will connect these to the backend in the next step
  const stats = [
    {
      label: 'Active Projects',
      value: '1',
      icon: LayoutDashboard,
      color: 'text-blue-600',
    },
    {
      label: 'Tasks Done',
      value: '1',
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    { label: 'In Progress', value: '1', icon: Clock, color: 'text-amber-600' },
    {
      label: 'Team Members',
      value: '1',
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name || 'Admin'}!
        </h1>
        <p className="text-slate-500 mt-1">
          Here is what is happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
            </div>
          </div>
        ))}
      </div>

      {/* Role Badge Section */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
        <span className="text-sm text-blue-800 font-medium">
          Logged in as:{' '}
          <span className="font-bold underline">
            {user?.email || 'admin@test.com'}
          </span>
        </span>
        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-wider">
          {user?.role || 'ADMIN'}
        </span>
      </div>
    </div>
  );
}
