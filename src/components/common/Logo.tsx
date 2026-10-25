import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg'; showTagline?: boolean }> = ({
  size = 'md',
  showTagline = true
}) => {
  const { language } = useLanguage();

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative ${iconSizes[size]} rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 p-[2px] shadow-lg shadow-indigo-500/25`}>
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
          {/* Logo SVG: Graduation Cap with Neural Network Nodes */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-3/4 h-3/4 text-indigo-400"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Cap */}
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="rgba(99, 102, 241, 0.2)" />
            <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
            {/* Neural Circuit Dot */}
            <circle cx="12" cy="14" r="1.5" fill="#38bdf8" />
            <circle cx="9" cy="16" r="1" fill="#ec4899" />
            <circle cx="15" cy="16" r="1" fill="#10b981" />
            <line x1="12" y1="14" x2="9" y2="16" stroke="#818cf8" strokeWidth="1" />
            <line x1="12" y1="14" x2="15" y2="16" stroke="#818cf8" strokeWidth="1" />
          </svg>
        </div>
      </div>
      <div>
        <div className={`font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent ${textSizes[size]}`}>
          SmartClass <span className="text-indigo-400">Pro</span>
        </div>
        {showTagline && (
          <div className="text-[11px] font-medium text-indigo-300/80 tracking-wide">
            AL-USWAH Super Admin
          </div>
        )}
      </div>
    </div>
  );
};
