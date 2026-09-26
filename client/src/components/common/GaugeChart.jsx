import React from 'react';
import { motion } from 'framer-motion';

export const GaugeChart = ({
  score = 78,
  max = 100,
  size = 140,
  strokeWidth = 12,
  label = 'CAREER READINESS',
  subtext = "You're on the right track.",
  showSubtext = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(score, 0), max);
  const strokeDashoffset = circumference - (percentage / max) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Animated Gradient Progress Stroke */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0e87e9" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Score Number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight"
          >
            {score}
          </motion.span>
          <span className="text-[11px] font-semibold text-slate-400 -mt-0.5">/ {max}</span>
        </div>
      </div>

      {/* Label and explanation */}
      {showSubtext && (
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md inline-block mb-1.5">
            {label}
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
            {score >= 75 ? 'Strong Employability Potential' : 'Foundation Building Phase'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            {subtext}
          </p>
        </div>
      )}
    </div>
  );
};
