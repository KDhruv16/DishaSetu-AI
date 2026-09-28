import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Bell, ShieldCheck } from 'lucide-react';
import { Badge } from './Badge';

export const TopHeader = () => {
  const { user, profile } = useAuth();
  const isDemo = user?.isDemo || user?.email === 'demo@dishasetu.ai';

  // Helper for greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-6 py-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Student Greeting & Demo Tag */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
                <span>{getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}</span>
                <span className="inline-block animate-wave">👋</span>
              </h2>

              {isDemo && (
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-0.5 rounded-md shadow-2xs">
                  ★ Demo Profile
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              You're making great progress. Keep going!
            </p>
          </div>
        </div>

        {/* Status badges & info */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="brand" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Target: {profile?.career?.targetRole || profile?.targetRole || 'Full Stack Developer'}</span>
          </Badge>

          <Badge variant="success" className="inline-flex items-center gap-1 px-2.5 py-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{user?.isOnboarded ? 'Profile Completed' : 'Profile Pending'}</span>
          </Badge>
        </div>
      </div>
    </header>
  );
};

