import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Target,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Command,
  User,
  ArrowRight
} from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';

export const TopHeader = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const isDemo = user?.isDemo || user?.email === 'demo@dishasetu.ai';

  const targetRole = profile?.career?.targetRole || profile?.targetRole || 'Full Stack Developer';
  const isProfileComplete = user?.isOnboarded;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/opportunities?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      
      {/* Left: Quick Search Bar */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, opportunities, roadmap... (Press ↵)"
            className="w-full pl-9 pr-14 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200/80 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono shadow-2xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </form>
      </div>

      {/* Right: Operational Status, Notifications & Profile */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Target Role Indicator */}
        <div
          onClick={() => navigate('/career')}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 cursor-pointer transition-colors"
          title="Click to view Career Pathway"
        >
          <div className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div className="text-left leading-none">
            <span className="text-[10px] text-slate-400 font-medium block">Target Track</span>
            <span className="text-xs font-bold text-slate-800 truncate max-w-[140px] block mt-0.5">
              {targetRole}
            </span>
          </div>
        </div>

        {/* Profile Completion Indicator */}
        <div
          onClick={() => navigate('/onboarding')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/60 text-emerald-800 cursor-pointer hover:bg-emerald-50 transition-colors"
          title="Onboarding Status"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-semibold">
            {isProfileComplete ? 'Profile 100% Ready' : 'Profile Incomplete'}
          </span>
        </div>

        {/* Demo Badge if applicable */}
        {isDemo && (
          <span className="hidden lg:inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-md font-mono">
            ★ Demo
          </span>
        )}

        {/* Notification Bell */}
        <div className="border-l border-slate-200 pl-3 ml-1 flex items-center gap-3">
          <NotificationBell />

          {/* Quick Profile Chip */}
          <div
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            title="Account Settings"
          >
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-display">
              {user?.name?.charAt(0).toUpperCase() || 'D'}
            </div>
            <span className="hidden xl:inline text-xs font-bold text-slate-800">
              {user?.name?.split(' ')[0] || 'Dhruv'}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
