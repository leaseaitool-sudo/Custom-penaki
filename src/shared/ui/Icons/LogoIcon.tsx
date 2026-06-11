
import React from 'react';

interface LogoIconProps {
  variant?: 'icon' | 'horizontal';
  className?: string;
}

const ICON_URL = 'https://firebasestorage.googleapis.com/v0/b/penaki-12292.firebasestorage.app/o/brand-assets%2Fpenaki%2Flogo-icon.svg?alt=media&token=0af4d222-2d24-4c10-8aa3-b86e8f0fd0f7';
const HORIZONTAL_URL = 'https://firebasestorage.googleapis.com/v0/b/penaki-12292.firebasestorage.app/o/brand-assets%2Fpenaki%2Flogo-horizontal.svg?alt=media&token=19ab475c-9ea2-40f0-86dd-c482e05a6d21';

export const LogoIcon: React.FC<LogoIconProps> = ({ variant = 'icon', className = '' }) => {
  const src = variant === 'icon' ? ICON_URL : HORIZONTAL_URL;
  
  return (
    <img 
      src={src} 
      alt="Penaki" 
      className={`select-none pointer-events-none ${className}`}
      draggable={false}
    />
  );
};
