'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut } from 'lucide-react';

export function UserNav() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const initials = user.name?.substring(0, 2).toUpperCase() || 'AD';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 p-2">
        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
          <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <p className="text-sm font-bold text-slate-900 truncate">
            {user.name}
          </p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
      </div>

      <button
        onClick={() => logout()}
        className="flex items-center space-x-2 w-full p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
      >
        <LogOut
          size={18}
          className="group-hover:translate-x-1 transition-transform"
        />
        <span className="text-sm font-semibold">Sign Out</span>
      </button>
    </div>
  );
}
