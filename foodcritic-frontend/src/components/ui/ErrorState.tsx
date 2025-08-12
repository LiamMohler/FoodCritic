import { ReactNode } from 'react';
import { ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorStateProps {
  title?: string;
  description?: string;
  variant?: 'error' | 'warning' | 'info';
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
}

const icons = {
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const variants = {
  error: {
    bg: 'bg-error-50',
    iconColor: 'text-error-600',
    titleColor: 'text-error-800',
    descriptionColor: 'text-error-700',
    buttonVariant: 'error' as const,
  },
  warning: {
    bg: 'bg-warning-50',
    iconColor: 'text-warning-600',
    titleColor: 'text-warning-800',
    descriptionColor: 'text-warning-700',
    buttonVariant: 'warning' as const,
  },
  info: {
    bg: 'bg-primary-50',
    iconColor: 'text-primary-600',
    titleColor: 'text-primary-800',
    descriptionColor: 'text-primary-700',
    buttonVariant: 'primary' as const,
  },
};

export const ErrorState = ({
  title,
  description,
  variant = 'error',
  actionLabel,
  onAction,
  children,
  className = '',
}: ErrorStateProps) => {
  const Icon = icons[variant];
  const config = variants[variant];

  return (
    <Card className={`${config.bg} ${className}`} padding="lg">
      <div className="text-center">
        <Icon className={`mx-auto h-12 w-12 ${config.iconColor} mb-4`} />
        
        {title && (
          <h3 className={`text-lg font-medium ${config.titleColor} mb-2`}>
            {title}
          </h3>
        )}
        
        {description && (
          <p className={`text-sm ${config.descriptionColor} mb-6 max-w-md mx-auto`}>
            {description}
          </p>
        )}
        
        {children}
        
        {actionLabel && onAction && (
          <Button
            variant={config.buttonVariant}
            onClick={onAction}
            className="mt-4"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};

export const NetworkErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <ErrorState
    variant="error"
    title="Network Error"
    description="Unable to connect to the server. Please check your internet connection and try again."
    actionLabel="Try Again"
    onAction={onRetry}
  />
);

export const NotFoundState = ({ 
  title = "Not Found", 
  description = "The item you're looking for doesn't exist.",
  onGoBack
}: { 
  title?: string; 
  description?: string; 
  onGoBack?: () => void;
}) => (
  <ErrorState
    variant="warning"
    title={title}
    description={description}
    actionLabel="Go Back"
    onAction={onGoBack}
  />
);

export const EmptyState = ({ 
  title = "No Data", 
  description = "There's nothing here yet.",
  actionLabel,
  onAction
}: { 
  title?: string; 
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <ErrorState
    variant="info"
    title={title}
    description={description}
    actionLabel={actionLabel}
    onAction={onAction}
  />
);