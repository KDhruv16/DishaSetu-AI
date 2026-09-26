import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ fullScreen = false, label = 'Loading DishaSetu AI...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#fafcff]/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin"></div>
          <div className="absolute font-bold text-brand-600 text-xs font-display">DS</div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
};
