import React, { useState } from 'react';
import { FiInfo, FiX } from 'react-icons/fi';

interface InfoTooltipProps {
  content: React.ReactNode;
  className?: string;
}

/**
 * InfoTooltip component that shows information on hover/click
 */
export function InfoTooltip({ content, className = '' }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        className="text-text-secondary hover:text-primary focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <FiInfo size={16} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-64 p-3 mt-2 -translate-x-1/2 left-1/2 bg-popover rounded-md shadow-lg text-sm text-popover-foreground">
          <div className="absolute top-0 left-1/2 -mt-2 -ml-2 w-4 h-4 transform rotate-45 bg-popover"></div>
          <div className="relative">
            <button 
              className="absolute top-0 right-0 p-1 text-text-secondary hover:text-text-primary"
              onClick={() => setIsOpen(false)}
            >
              <FiX size={12} />
            </button>
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

export default InfoTooltip; 