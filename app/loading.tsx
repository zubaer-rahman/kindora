import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('flex-col items-center justify-center', {
  variants: {
    show: {
      true: 'flex',
      false: 'hidden',
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva('animate-spin text-blue-600', {
  variants: {
    size: {
      small: 'size-6',
      medium: 'size-8',
      large: 'size-12',
      extra_large: 'size-[60px]',
    },
  },
  defaultVariants: {
    size: 'extra_large',
  },
});

interface LoadingProps
  extends VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
  className?: string;
  children?: React.ReactNode;
}

const Loading: React.FC<LoadingProps> = ({
  size,
  show,
  children,
  className,
}: LoadingProps) => {
  return (
    <div className="flex min-h-screen justify-center items-center">
      <span className={spinnerVariants({ show })}>
        <Loader2 className={cn(loaderVariants({ size }), className)} />
        {children}
      </span>
    </div>
  );
};

export default Loading;
