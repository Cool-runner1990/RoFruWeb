import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[14px] font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0',
        secondary: 'bg-surface border border-outline text-on-surface hover:bg-surface-variant',
        outlined: 'border-2 border-primary text-primary hover:bg-primary-container',
        ghost: 'hover:bg-surface-variant text-on-surface',
        destructive: 'bg-error text-white hover:opacity-90',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-5 py-3 text-base',
        lg: 'px-6 py-4 text-lg',
        icon: 'p-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
