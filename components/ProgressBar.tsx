
import React from 'react';
import '../styles/ProgressBar.css';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-gradient-to-r from-sky-400 to-primary h-full rounded-full transition-all duration-300 ease-out progress-bar-fill"
        style={{ '--progress': `${progress}%` } as React.CSSProperties}
      ></div>
    </div>
  );
};
