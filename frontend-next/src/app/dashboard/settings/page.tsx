// src/app/dashboard/settings/page.tsx
'use client';

import { Settings, Bell, Lock, User } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <User className="text-slate-400" size={20} />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Profile Information
              </p>
              <p className="text-xs text-slate-500">
                Update your name and email address.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <Bell className="text-slate-400" size={20} />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Notifications
              </p>
              <p className="text-xs text-slate-500">
                Configure how you receive alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-red-600">
          <div className="flex items-center gap-3">
            <Lock className="text-red-400" size={20} />
            <div>
              <p className="text-sm font-medium">Security</p>
              <p className="text-xs text-red-400">
                Manage your password and sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
