import React from 'react';
import { cn } from '../../utils/cn';

export function Icon({ name, className, ...props }) {
  return (
    <span
      className={cn('material-symbols-outlined select-none', className)}
      {...props}
    >
      {name}
    </span>
  );
}
