import React from 'react';
import { HelpCircle, AlertCircle, FileQuestion, MessageCircleQuestion } from 'lucide-react';
import { Card } from '../common/Card';

export const ProblemSection = () => {
  const problems = [
    {
      icon: HelpCircle,
      title: 'Which career should I choose?',
      desc: 'Overwhelmed by endless job titles and unsure which tech role aligns with your genuine strengths.',
    },
    {
      icon: AlertCircle,
      title: 'What skills am I missing?',
      desc: 'College curriculum often leaves silent gaps compared to what fast-moving tech companies actually hire for.',
    },
    {
      icon: FileQuestion,
      title: 'Is my resume job-ready?',
      desc: 'Sending hundreds of applications into the void without knowing if ATS scanners are filtering you out.',
    },
    {
      icon: MessageCircleQuestion,
      title: 'Am I ready for interviews?',
      desc: 'Entering technical and HR rounds without real practice, objective feedback, or confidence scoring.',
    },
  ];

  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-md">
            The Core Challenge
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
            Students don't lack ambition.{' '}
            <span className="text-slate-500">They lack direction.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500">
            Without clear, personalized guidance, talented graduates spend months guessing instead of progressing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                hoverEffect
                className="p-6 border border-slate-200/70 bg-slate-50/40 hover:bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
