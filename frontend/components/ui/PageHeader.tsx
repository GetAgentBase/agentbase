import React from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonHref?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  showBackButton = false,
  backButtonLabel = 'Back',
  backButtonHref = '/dashboard',
}) => {
  const router = useRouter();
  
  const handleBack = () => {
    router.push(backButtonHref);
  };
  
  return (
    <div className="border-b border-sidebar-border py-5 px-6 bg-panel-header mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="mr-2"
              >
                ← {backButtonLabel}
              </Button>
            )}
            <h1 className="text-xl font-medium text-text-primary">{title}</h1>
          </div>
          {description && (
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader; 