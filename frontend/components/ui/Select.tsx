import React, { useState, useRef, useEffect, ReactElement } from 'react';

// Context to share state between components
interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

interface SelectProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function Select({
  children,
  value,
  onValueChange,
  className = ''
}: SelectProps) {
  // The Select component acts as a context provider
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className={`relative ${className}`}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectTrigger({
  children,
  className = ''
}: SelectTriggerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);
  
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 text-left text-sm rounded-md border border-border bg-background hover:border-primary/50 ${className}`}
      >
        {children}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <SelectContext.Consumer>
          {(context) => {
            // Find SelectContent in children
            const content = React.Children.toArray(children).find(
              (child) => React.isValidElement(child) && child.type === SelectContent
            ) as ReactElement<SelectContentProps> | undefined;
            
            // If we found content, clone it with open state
            if (content) {
              return React.cloneElement(content, {
                open,
                setOpen,
                // Pass context as props explicitly
                value: context?.value,
                onValueChange: context?.onValueChange
              });
            }
            return null;
          }}
        </SelectContext.Consumer>
      )}
    </div>
  );
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function SelectValue({
  placeholder = 'Select an option',
  className = ''
}: SelectValueProps) {
  // Get value from context
  return (
    <SelectContext.Consumer>
      {(context) => {
        if (!context) return <span className={className}>{placeholder}</span>;
        
        return (
          <span className={`block truncate ${className}`}>
            {context.value || placeholder}
          </span>
        );
      }}
    </SelectContext.Consumer>
  );
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function SelectContent({
  children,
  className = '',
  open = false,
  setOpen,
  value,
  onValueChange
}: SelectContentProps) {
  if (!open) return null;

  const handleSelect = (itemValue: string) => {
    if (onValueChange) {
      onValueChange(itemValue);
      if (setOpen) setOpen(false);
    }
  };
  
  // Clone each child (SelectItem) and inject handleSelect
  const items = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === SelectItem) {
      return React.cloneElement(child as ReactElement<SelectItemProps>, {
        onSelect: handleSelect,
        isSelected: (child as ReactElement<SelectItemProps>).props.value === value
      });
    }
    return child;
  });
  
  return (
    <div className={`absolute left-0 z-10 mt-1 w-full rounded-md border border-border bg-background shadow-lg ${className}`}>
      <div className="py-1 max-h-60 overflow-auto">
        {items}
      </div>
    </div>
  );
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  onSelect?: (value: string) => void;
  isSelected?: boolean;
}

export function SelectItem({
  children,
  value,
  className = '',
  onSelect,
  isSelected = false
}: SelectItemProps) {
  const handleClick = () => {
    if (onSelect) onSelect(value);
  };
  
  return (
    <div
      className={`px-3 py-2 text-sm cursor-pointer ${
        isSelected 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-text-primary hover:bg-card-hover'
      } ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

// For backwards compatibility
export function SelectProvider({ children }: { children: React.ReactNode }) {
  return children;
} 