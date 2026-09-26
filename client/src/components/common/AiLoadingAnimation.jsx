import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, CheckCircle2 } from 'lucide-react';

export const AiLoadingAnimation = ({ label = 'Generating AI Career Intelligence...' }) => {
  const steps = [
    'Analyzing your profile & academic background...',
    'Understanding your current skills & experience...',
    'Benchmarking against industry standards & live roles...',
    'Pinpointing skill gaps & building your next step...',
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-soft">
      {/* Animated Glowing Orb */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 animate-pulse flex items-center justify-center shadow-lg shadow-brand-500/25">
          <BrainCircuit className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        <div className="absolute -inset-2 rounded-full border-2 border-brand-300/40 animate-ping pointer-events-none" />
      </div>

      <h3 className="text-lg font-bold font-display text-slate-900 text-center mb-2">
        {label}
      </h3>

      {/* Step cycling text */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-xs font-semibold text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200/60"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>{steps[currentStepIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center max-w-sm">
        Customizing recommendation pathways based strictly on your verified profile.
      </p>
    </div>
  );
};
