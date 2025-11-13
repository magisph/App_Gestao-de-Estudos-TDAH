import { forwardRef } from 'react';
import clsx from 'clsx';

export const ScrollArea = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('relative overflow-y-auto', className)}
    {...props}
  >
    {children}
  </div>
));

ScrollArea.displayName = 'ScrollArea';
