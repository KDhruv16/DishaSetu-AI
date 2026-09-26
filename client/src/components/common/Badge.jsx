import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // default | success | warning | danger | brand | purple
  className = '',
  size = 'md', // sm | md
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/60',
    brand: 'bg-brand-50 text-brand-700 border border-brand-200/60 font-medium',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/60 font-medium',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/60 font-medium',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/60 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
