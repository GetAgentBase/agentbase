import React, { ReactElement } from 'react';

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, className = '', children }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  // Clone children and inject active state
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === TabsContent) {
        return React.cloneElement(child as ReactElement<TabsContentProps>, {
          active: (child as ReactElement<TabsContentProps>).props.value === activeTab,
        });
      } else if (child.type === TabsList) {
        return React.cloneElement(child as ReactElement<TabsListProps>, {
          activeTab,
          setActiveTab,
        });
      }
    }
    return child;
  });

  return (
    <div className={`w-full ${className}`}>
      {childrenWithProps}
    </div>
  );
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

export function TabsList({ className = '', children, activeTab, setActiveTab }: TabsListProps) {
  // Clone children and inject active state and click handler
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === TabsTrigger) {
      return React.cloneElement(child as ReactElement<TabsTriggerProps>, {
        active: (child as ReactElement<TabsTriggerProps>).props.value === activeTab,
        onClick: () => setActiveTab?.((child as ReactElement<TabsTriggerProps>).props.value),
      });
    }
    return child;
  });

  return (
    <div className={`flex space-x-2 overflow-x-auto ${className}`}>
      {childrenWithProps}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function TabsTrigger(
  { 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    value, 
    className = '', 
    children, 
    active, 
    onClick 
  }: TabsTriggerProps
) {
  return (
    <button
      type="button"
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-transparent text-text-secondary hover:bg-card-hover'
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  active?: boolean;
}

export function TabsContent(
  { 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    value, 
    className = '', 
    children, 
    active 
  }: TabsContentProps
) {
  if (!active) {
    return null;
  }

  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
} 