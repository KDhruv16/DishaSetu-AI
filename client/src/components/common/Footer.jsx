import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 font-display">DishaSetu AI</span>
              <p className="text-xs text-slate-500">Bridging Campus to Career with Intelligent Mentorship</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <span>Aligned with NEP 2020</span>
            <span className="hidden sm:inline">•</span>
            <span>Skill India & Viksit Bharat 2047</span>
            <span className="hidden sm:inline">•</span>
            <span>MP Online Hackathon 2026</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 DishaSetu AI. Built for the MP Online Idea & Innovation Challenge.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Empowering students from classroom to corporate
          </p>
        </div>
      </div>
    </footer>
  );
};
