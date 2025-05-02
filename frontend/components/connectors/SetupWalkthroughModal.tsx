import React, { useState, useEffect } from 'react';
import { ConnectorWalkthrough } from '@/types/api';
import apiClient from '@/lib/apiClient';
import { FiX, FiArrowLeft, FiArrowRight, FiExternalLink, FiAlertCircle, FiCheck, FiInfo, FiHelpCircle } from 'react-icons/fi';

interface SetupWalkthroughModalProps {
  connectorName: string;
  onClose: () => void;
  onComplete?: () => void;
}

const SetupWalkthroughModal: React.FC<SetupWalkthroughModalProps> = ({ 
  connectorName, 
  onClose,
  onComplete
}) => {
  const [walkthrough, setWalkthrough] = useState<ConnectorWalkthrough | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  
  // Fetch the walkthrough data when the component mounts
  useEffect(() => {
    const fetchWalkthrough = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.getConnectorWalkthrough(connectorName);
        setWalkthrough(data);
      } catch (err) {
        console.error('Error loading walkthrough:', err);
        setError('Failed to load setup instructions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWalkthrough();
  }, [connectorName]);
  
  // Handle next/previous navigation
  const goToNextStep = () => {
    if (walkthrough && currentStep < walkthrough.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Mark setup as complete
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };
  
  // Toggle troubleshooting section
  const toggleTroubleshooting = () => {
    setShowTroubleshooting(!showTroubleshooting);
  };
  
  // Helper to render markdown-like links as actual links
  const renderInstructions = (instruction: string) => {
    // Match markdown-style links: [text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    
    if (!linkRegex.test(instruction)) {
      return <span>{instruction}</span>;
    }
    
    // Reset regex state
    linkRegex.lastIndex = 0;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = linkRegex.exec(instruction)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(instruction.substring(lastIndex, match.index));
      }
      
      // Add the link
      const [, text, url] = match;
      parts.push(
        <a 
          key={match.index} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center"
        >
          {text}
          <FiExternalLink className="ml-1" size={12} />
        </a>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last link
    if (lastIndex < instruction.length) {
      parts.push(instruction.substring(lastIndex));
    }
    
    return <span>{parts}</span>;
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-background rounded-xl shadow-2xl w-full max-w-3xl p-6 flex flex-col max-h-[90vh] border border-border/30">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold">Setting up {connectorName}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors">
              <FiX size={20} />
            </button>
          </div>
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-3 border-primary rounded-full border-t-transparent"></div>
            <span className="ml-3 text-text-secondary font-medium">Loading setup instructions...</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-background rounded-xl shadow-2xl w-full max-w-3xl p-8 flex flex-col max-h-[90vh] border border-border/30">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold">Setting up {connectorName}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors">
              <FiX size={20} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiAlertCircle size={48} className="text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-3">Failed to load setup instructions</h3>
            <p className="text-text-secondary mb-6">{error}</p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // No walkthrough data
  if (!walkthrough) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-background rounded-xl shadow-2xl w-full max-w-3xl p-8 flex flex-col max-h-[90vh] border border-border/30">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold">Setting up {connectorName}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors">
              <FiX size={20} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-text-secondary mb-6">No setup walkthrough available for this connector.</p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Get current step data
  const step = walkthrough.steps[currentStep];
  const isLastStep = currentStep === walkthrough.steps.length - 1;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden border border-border/30">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center">
            {walkthrough.name} Setup
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors">
            <FiX size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Steps sidebar */}
          <div className="w-64 border-r border-border overflow-y-auto bg-card/20">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                <h3 className="text-sm font-medium">Setup Progress</h3>
              </div>
              
              <div className="mt-4 space-y-2">
                {walkthrough.steps.map((s, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`group w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center ${
                      index === currentStep 
                        ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
                        : index < currentStep
                          ? 'bg-primary/10 hover:bg-primary/20 text-text-primary'
                          : 'hover:bg-muted text-text-primary'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 text-xs font-medium shrink-0
                      ${index === currentStep 
                        ? 'bg-white/20' 
                        : index < currentStep
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted-foreground/20 group-hover:bg-muted-foreground/30'
                      }`}>
                      {index + 1}
                    </div>
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-border">
              <button
                onClick={toggleTroubleshooting}
                className={`flex items-center text-sm py-2.5 px-4 rounded-lg w-full transition-colors
                  ${showTroubleshooting 
                    ? 'bg-muted text-text-primary' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-muted/50'}`}
              >
                <FiHelpCircle size={16} className="mr-2" />
                {showTroubleshooting ? 'Hide' : 'Show'} Troubleshooting
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-8 overflow-y-auto">
              {/* Current step content */}
              {!showTroubleshooting ? (
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-medium mb-3">{step.title}</h3>
                  <p className="text-text-secondary text-base mb-7">{step.description}</p>
                  
                  <div className="bg-card/30 rounded-lg p-6 mb-8 border border-border/50">
                    <h4 className="text-sm font-medium text-text-primary mb-4 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                      Instructions
                    </h4>
                    <div className="space-y-3 ml-3">
                      {step.instructions.map((instruction, idx) => {
                        // Check if it starts with a number (e.g., "1. ")
                        const hasNumberPrefix = /^\d+\.\s/.test(instruction);
                        
                        return (
                          <div 
                            key={idx} 
                            className={`pl-4 ${hasNumberPrefix ? 'border-l-0' : 'border-l-2 border-primary/30'} py-1`}
                          >
                            {renderInstructions(instruction)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {isLastStep && (
                    <div className="mt-8 p-5 rounded-lg border border-primary/30 bg-primary/5">
                      <h4 className="font-medium mb-2 flex items-center text-primary">
                        <FiInfo size={16} className="mr-2" />
                        Final Step
                      </h4>
                      <p className="text-text-secondary ml-6">
                        After completing these steps, you'll be able to use your credentials to connect the {walkthrough.name} service.
                        Click "Complete Setup" below when you're ready to enter your credentials.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-medium mb-3">Troubleshooting</h3>
                  <p className="text-text-secondary mb-7">Common issues and solutions for {walkthrough.name}</p>
                  
                  <div className="space-y-5">
                    {walkthrough.troubleshooting.map((item, idx) => (
                      <div key={idx} className="p-5 border border-border/50 bg-card/30 rounded-lg shadow-sm">
                        <h4 className="font-medium mb-2 flex items-center">
                          <FiAlertCircle size={16} className="text-amber-500 mr-2" />
                          {item.issue}
                        </h4>
                        <p className="text-text-secondary pl-6">{item.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer with navigation */}
            <div className="px-8 py-4 border-t border-border flex justify-between items-center bg-card/10">
              <button
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                  currentStep === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'bg-muted hover:bg-muted/80 text-text-primary'
                }`}
              >
                <FiArrowLeft className="mr-2" />
                Previous
              </button>
              
              <div className="flex items-center">
                {walkthrough.steps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-2 h-2 mx-0.5 rounded-full transition-colors ${
                      idx === currentStep 
                        ? 'bg-primary' 
                        : idx < currentStep
                          ? 'bg-primary/40'
                          : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              
              {isLastStep ? (
                <button
                  onClick={handleComplete}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-md flex items-center shadow-sm hover:bg-primary/90 transition-colors"
                >
                  <FiCheck className="mr-2" />
                  Complete Setup
                </button>
              ) : (
                <button
                  onClick={goToNextStep}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-md flex items-center shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Next
                  <FiArrowRight className="ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWalkthroughModal; 