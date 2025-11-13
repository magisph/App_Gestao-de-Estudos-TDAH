import React from 'react';
import clsx from 'clsx';

export const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('relative overflow-y-auto', className)}
    {...props}
  >
    {children}
  </div>
));

ScrollArea.displayName = 'ScrollArea';
