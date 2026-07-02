import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-slate-900/60 border-b border-slate-800 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Management Console</h2>
          <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-800">
            <span className="material-icons text-amber-500 text-base">admin_panel_settings</span>
            <span className="font-semibold text-xs tracking-wider text-slate-300">
              {user ? `${user.firstName} ${user.lastName}`.toUpperCase() : 'ADMINISTRATOR'}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
