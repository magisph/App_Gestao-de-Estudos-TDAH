import clsx from 'clsx';

const variantStyles = {
  default: 'bg-primary text-primary-foreground border-transparent',
  secondary: 'bg-secondary text-secondary-foreground border-transparent',
  destructive: 'bg-destructive text-destructive-foreground border-transparent',
  outline: 'text-foreground border-border'
};

export const Badge = ({ className, variant = 'default', ...props }) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
      variantStyles[variant] ?? variantStyles.default,
      className
    )}
    {...props}
  />
);
