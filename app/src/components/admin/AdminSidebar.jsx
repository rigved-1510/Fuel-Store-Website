import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminSidebar() {
  const { logout } = useAuth();

  const links = [
    { to: '/admin', label: 'Overview', icon: 'dashboard', end: true },
    { to: '/admin/products', label: 'Products', icon: 'inventory' },
    { to: '/admin/orders', label: 'Orders', icon: 'shopping_cart' },
    { to: '/admin/users', label: 'Users', icon: 'people' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0">
      {/* Brand header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <span className="material-icons text-amber-500 text-2xl font-bold">shield</span>
        <div>
          <h1 className="font-bold text-white text-lg tracking-wide leading-none">FUEL FASHION</h1>
          <span className="text-xs text-amber-500 font-semibold tracking-wider uppercase">Admin Panel</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium tracking-wide transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="material-icons text-[20px]">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile & action links */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all font-medium text-sm"
        >
          <span className="material-icons text-[18px]">storefront</span>
          <span>Return to Store</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-all font-medium text-sm text-left"
        >
          <span className="material-icons text-[18px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
