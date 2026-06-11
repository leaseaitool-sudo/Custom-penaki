import React from 'react';

export const FloppyDiskIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V8.25l-4.5-4.5H5.25A2.25 2.25 0 003 6v10.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9V5.25m-3 11.25h-1.5a1.5 1.5 0 01-1.5-1.5v-1.5a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5z" />
  </svg>
);
