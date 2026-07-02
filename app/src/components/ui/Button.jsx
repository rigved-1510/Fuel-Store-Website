import React from 'react';
import { cn } from '../../utils/cn';

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-on-primary hover:opacity-90 active:scale-95 shadow-md',
    secondary: 'bg-secondary text-on-secondary hover:brightness-110 active:scale-95 shadow-md shadow-secondary/15',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-on-primary',
    outlineWhite: 'border-2 border-white text-white hover:bg-white hover:text-on-surface',
    text: 'text-on-surface hover:text-secondary bg-transparent active:scale-100',
  };

  const sizes = {
    sm: 'px-md py-xs text-label-sm',
    md: 'px-lg py-sm text-label-md',
    lg: 'px-xl py-md text-headline-sm',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined animate-spin mr-base">sync</span>
      ) : null}
      {children}
    </button>
  );
}
