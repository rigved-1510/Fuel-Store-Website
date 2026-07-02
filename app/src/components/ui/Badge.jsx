import React from 'react';
import { cn } from '../../utils/cn';

export function Badge({ children, className, variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-primary text-on-primary',
    secondary: 'bg-secondary text-on-secondary',
    sale: 'bg-secondary text-on-secondary',
    new: 'bg-primary text-on-primary',
    limited: 'bg-inverse-surface text-surface',
    outline: 'border border-outline text-on-surface-variant',
  };

  return (
    <span
      className={cn(
        'inline-block text-[10px] md:text-label-sm font-bold px-3 py-1 uppercase rounded-full tracking-widest select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
