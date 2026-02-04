import React, { useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface ScrollAnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  tag?: React.ElementType;
}

export const ScrollAnimatedSection: React.FC<ScrollAnimatedSectionProps> = ({ children, className = '', tag: Tag = 'section' }) => {
  const [ref, isInView] = useScrollAnimation<HTMLElement>();

  const combinedClassName = `${className} scroll-animate ${isInView ? 'in-view' : ''}`;

  return React.createElement(
    Tag,
    { ref, className: combinedClassName },
    children
  );
};