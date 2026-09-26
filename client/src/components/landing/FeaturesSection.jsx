import React from 'react';
import {
  Compass,
  Zap,
  Gauge,
  Milestone,
  FileCheck2,
  MessageSquareCode,
  Briefcase,
  Landmark,
} from 'lucide-react';
import { Card } from '../common/Card';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Compass,
      title: 'AI Career Guidance',
      desc: 'Matches your genuine interests and academic strengths with optimal industry roles.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Zap,
      title: 'Skill Gap Analysis',
      desc: 'Pinpoints exactly which high-demand technologies you are missing for your target role.',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Gauge,
      title: 'Career Readiness Score',
      desc: 'A real-time benchmark (0-100) reflecting your market readiness at any given moment.',
      color: 'bg-brand-50 text-brand-600',
    },
    {
      icon: Milestone,
      title: 'Personalized Roadmap',
      desc: 'Week-by-week actionable steps so you always know what to learn next.',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      icon: FileCheck2,
      title: 'Resume Intelligence',
      desc: 'Scans your resume against real ATS algorithms to boost keyword match and structure.',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: MessageSquareCode,
      title: 'Mock Interviews',
      desc: 'Role-tailored simulated questions with instant feedback on clarity and technical depth.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Briefcase,
      title: 'Opportunity Matching',
      desc: 'Curated internships and jobs ranked by your unique skill fit percentage.',
      color: 'bg-sky-50 text-sky-600',
    },
    {
      icon: Landmark,
      title: 'Government Opportunities',
      desc: 'Integrated with MP Online, Rojgar Setu, NAPS apprenticeships, and Skill India schemes.',
      color: 'bg-rose-50 text-rose-600',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-md">
            Features
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
            Intelligence that guides,{' '}
            <span className="gradient-text">simplicity that works.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500">
            Every capability designed to answer: "What should I do next to get hired?"
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card
                key={idx}
                hoverEffect
                className="p-6 border border-slate-200/70 hover:border-brand-200 bg-white"
              >
                <div className={`w-11 h-11 rounded-xl ${feat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display mb-1.5">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {feat.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
