import React from 'react';
import { User, Compass, Zap, BookOpen, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';

export const SolutionSection = () => {
  const steps = [
    { label: 'Profile', icon: User, desc: 'Your background' },
    { label: 'Career', icon: Compass, desc: 'Target direction' },
    { label: 'Skills', icon: Zap, desc: 'Gap diagnosis' },
    { label: 'Learn', icon: BookOpen, desc: 'Focused roadmap' },
    { label: 'Apply', icon: Briefcase, desc: 'Smart matches' },
    { label: 'Prepare', icon: CheckCircle2, desc: 'Mock interview' },
  ];

  return (
    <section id="why-dishasetu" className="py-20 bg-[#fafcff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-md">
            The DishaSetu Advantage
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
            DishaSetu turns confusion into a{' '}
            <span className="gradient-text">clear career path.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500">
            A continuous, intelligent loop connecting every milestone from your first college semester to your dream offer.
          </p>
        </div>

        {/* Visual Stepper Bar */}
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    0{idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 font-display">
                    {step.label}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
