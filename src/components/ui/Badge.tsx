import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary',
        secondary: 'bg-secondary-container text-secondary',
        success: 'bg-success-light text-success',
        error: 'bg-error-light text-error',
        warning: 'bg-warning-light text-warning',
        outline: 'border border-outline text-on-surface',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
