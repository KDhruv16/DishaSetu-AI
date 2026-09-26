import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-300 ${
        glass
          ? 'glass-card shadow-soft'
          : 'bg-white border border-slate-100 shadow-soft'
      } ${
        hoverEffect
          ? 'hover:shadow-premium hover:-translate-y-0.5 hover:border-slate-200 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
