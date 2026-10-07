import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Compass,
  Zap,
  Milestone,
  BookOpen,
  Bot,
  Briefcase,
  FileText,
  MessageSquareCode,
  CheckSquare,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const navSections = [
    {
      title: 'Career OS',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Career', path: '/career', icon: Compass },
        { name: 'Skills', path: '/skills', icon: Zap },
        { name: 'Roadmap', path: '/roadmap', icon: Milestone },
        { name: 'Learning', path: '/learning', icon: BookOpen },
      ]
    },
    {
      title: 'Tools & Intelligence',
      items: [
        { name: 'AI Copilot', path: '/assistant', icon: Bot, badge: 'AI' },
        { name: 'Resume', path: '/resume', icon: FileText },
        { name: 'Interview', path: '/interview', icon: MessageSquareCode, badge: 'Practice' },
      ]
    },
    {
      title: 'Placement',
      items: [
        { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
        { name: 'Applications', path: '/applications', icon: CheckSquare },
      ]
    }
  ];

  const targetRole = profile?.career?.targetRole || profile?.targetRole || 'Full Stack Dev';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/90 h-screen sticky top-0 shrink-0 z-30 select-none">
        
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Geometric brand mark */}
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-xs">
              <div className="relative flex items-center justify-center">
                <span className="font-display font-extrabold text-sm text-indigo-400">DS</span>
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-base tracking-tight text-slate-900 font-display">
                  DishaSetu
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase tracking-wider font-mono">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Campus to Career OS
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto divide-y divide-slate-100/80">
          {navSections.map((section, sIdx) => (
            <div key={section.title} className={sIdx > 0 ? 'pt-4' : ''}>
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  {section.title}
                </span>
              </div>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) =>
                        `group relative flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          isActive
                            ? 'bg-slate-100 text-slate-950 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Subtle active vertical left accent */}
                            {isActive && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-indigo-600" />
                            )}
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                              }`}
                            />
                            <span className="truncate">{item.name}</span>
                          </div>

                          {item.badge && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold tracking-tight ${
                              isActive
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile / Status Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 font-display">
                {user?.name?.charAt(0).toUpperCase() || 'D'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {user?.name || 'Dhruv Khatri'}
                </p>
                <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                  {targetRole}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1 px-2 flex items-center gap-1 overflow-x-auto shadow-lg no-scrollbar">
        {navSections.flatMap(s => s.items).slice(0, 7).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all shrink-0 ${
                  isActive
                    ? 'text-indigo-600 font-bold bg-slate-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="whitespace-nowrap">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
};

