import React from 'react';
import { UserCheck, Cpu, Navigation, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

export const HowItWorksSection = () => {
  const steps = [
    {
      num: '01',
      title: 'Build Your Profile',
      desc: 'Fill our 2-minute student intake covering your college, stream, semester, current skills, and ambitions.',
      icon: UserCheck,
    },
    {
      num: '02',
      title: 'Get Your Career Intelligence',
      desc: 'Our engine computes your live Career Readiness Score, matches target roles, and pinpoints exact skill gaps.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Follow Your Personalized Path',
      desc: 'Work through your tailored weekly roadmap, optimize your resume, practice interviews, and apply with confidence.',
      icon: Navigation,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50/60 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-md">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
            Three steps to clarity.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500">
            No complicated setup. Just intuitive, step-by-step career progression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-premium transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-extrabold font-display text-brand-200">
                    {step.num}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
