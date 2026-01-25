'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { Settings, Bell, Lock, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  const handleUpdate = (section: string) => {
    toast.info(`${section} updates are disabled in this preview.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">
          Manage your enterprise account and security protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Section */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <User className="text-blue-600" size={20} />
            <h2 className="font-bold text-slate-800">Profile Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Full Name
                </label>
                <p className="p-2 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100 italic">
                  {user?.name || 'Not set'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Email Address
                </label>
                <p className="p-2 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleUpdate('Profile')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Request name change →
            </button>
          </div>
        </section>

        {/* Security & System Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-green-600" size={20} />
              <h3 className="font-bold text-slate-800">Security</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Password last changed 30 days ago.
            </p>
            <button
              onClick={() => handleUpdate('Security')}
              className="w-full bg-slate-900 text-white py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
            >
              Update Password
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-purple-600" size={20} />
              <h3 className="font-bold text-slate-800">Notifications</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Manage how you receive alerts and emails.
            </p>
            <button
              onClick={() => handleUpdate('Notifications')}
              className="w-full border border-slate-200 text-slate-700 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
            >
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
