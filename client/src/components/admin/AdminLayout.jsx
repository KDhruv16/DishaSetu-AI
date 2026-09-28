import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Compass,
  Cpu,
  GitFork,
  HelpCircle,
  BookOpen,
  Map,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Education', path: '/admin/education', icon: GraduationCap },
  { name: 'Target Roles', path: '/admin/roles', icon: Compass },
  { name: 'Skills', path: '/admin/skills', icon: Cpu },
  { name: 'Role-Skill Mapping', path: '/admin/role-skills', icon: GitFork },
  { name: 'Interview Questions', path: '/admin/questions', icon: HelpCircle },
  { name: 'Learning Content', path: '/admin/learning', icon: BookOpen },
  { name: 'Roadmaps', path: '/admin/roadmaps', icon: Map },
  { name: 'Candidates', path: '/admin/users', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#fafcff] text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-brand-500 selection:text-white">
      {/* Mobile Top Nav */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-slate-200/80 z-50 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-none font-display">
              DishaSetu <span className="text-brand-600">Admin</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Platform Governance</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-slate-900 block leading-none font-display">
                  DishaSetu<span className="text-brand-600">.AI</span>
                </span>
                <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200/60 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Admin Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Master Governance
            </span>
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-opacity ${
                          isActive ? 'text-brand-600 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors border border-slate-200/80 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Candidate</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-xs font-medium text-rose-700 transition-colors border border-rose-200/60"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fafcff]">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
