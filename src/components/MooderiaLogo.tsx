import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const MooderiaLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Neural Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 rounded-xl rotate-3 shadow-md shadow-purple-500/25"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-violet-700 rounded-xl -rotate-3 opacity-90"></div>
        
        {/* Futuristic M-Brain Glyph */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10 w-5/6 h-5/6 text-white drop-shadow"
        >
          {/* Central neural node */}
          <path d="M4 18V6l4 5 4-5 4 5 4-5v12" />
          <circle cx="12" cy="11" r="1.5" fill="#34d399" stroke="none" />
          <circle cx="4" cy="6" r="1.2" fill="#c4b5fd" stroke="none" />
          <circle cx="20" cy="6" r="1.2" fill="#c4b5fd" stroke="none" />
          <path d="M8 18h8" strokeWidth="1.5" stroke="#a78bfa" />
        </svg>

        {/* Ambient glow dot */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm shadow-emerald-400/80 animate-pulse"></span>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-900 text-[15px] sm:text-base font-display">
              MOODERIA
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wider">
              AI
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-widest text-purple-600/90 uppercase mt-0.5">
            GROUP
          </span>
        </div>
      )}
    </div>
  );
};
