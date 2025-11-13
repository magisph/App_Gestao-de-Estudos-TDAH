import { forwardRef } from 'react';
import clsx from 'clsx';

export const Progress = forwardRef(({ value = 0, className, ...props }, ref) => {
  const clamped = Math.min(100, Math.max(0, Number(value)));

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={clsx('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
});

Progress.displayName = 'Progress';
