import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'circle' | 'image';
  lines?: number;
}

export const Skeleton = ({ className, variant = 'default', lines = 1, ...props }: SkeletonProps) => {
  const baseClasses = 'animate-pulse bg-secondary-200 rounded';
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        {
          'h-4 w-full': variant === 'default' || variant === 'text',
          'h-64 w-full': variant === 'card',
          'h-10 w-10 rounded-full': variant === 'circle',
          'h-48 w-full': variant === 'image',
        },
        className
      )}
      {...props}
    />
  );
};

export const SkeletonCard = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('bg-white rounded-2xl shadow-card overflow-hidden', className)} {...props}>
    <Skeleton variant="image" />
    <div className="p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton variant="text" lines={2} />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 3, className, ...props }: { count?: number } & HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-6', className)} {...props}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);