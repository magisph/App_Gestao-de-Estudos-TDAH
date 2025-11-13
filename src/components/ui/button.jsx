import { forwardRef } from 'react';
import clsx from 'clsx';

const baseStyles =
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background';

const variantStyles = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
};

const sizeStyles = {
  sm: 'h-9 px-3 rounded-md',
  md: 'h-10 px-4 py-2',
  lg: 'h-11 px-6 rounded-md'
};

export const Button = forwardRef(({ className, variant = 'default', size = 'md', ...props }, ref) => (
  <button
    ref={ref}
    className={clsx(
      baseStyles,
      variantStyles[variant] ?? variantStyles.default,
      sizeStyles[size] ?? sizeStyles.md,
      className
    )}
    {...props}
  />
));

Button.displayName = 'Button';
