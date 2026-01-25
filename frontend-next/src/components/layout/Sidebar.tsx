'use client';

import { LayoutDashboard, Users, FolderKanban, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Teams', href: '/dashboard/teams' },
    { icon: FolderKanban, label: 'Projects', href: '/dashboard/projects' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
