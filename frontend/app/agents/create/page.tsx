'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';
import { AgentCreateRequest } from '@/types/api';
import SidebarLayout from '@/components/ui/SidebarLayout';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function CreateAgentPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<AgentCreateRequest>({
    name: '',
    description: '',
    system_prompt: '',
    llm_config_id: undefined,
  });
  const [llmConfigs, setLlmConfigs] = useState<Array<{ id: string, provider: string, model_name: string, is_default?: boolean }>>([]);
  const [isLoadingLlmConfigs, setIsLoadingLlmConfigs] = useState(false);

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    system_prompt: '',
    llm_config_id: '',
  });

  // Fetch LLM configurations on component mount
  useEffect(() => {
    if (user) {
      fetchLlmConfigs();
    }
  }, [user]);

  // Fetch the user's LLM configurations
  const fetchLlmConfigs = async () => {
    setIsLoadingLlmConfigs(true);
    try {
      const configs = await apiClient.getLlmConfigs();
      setLlmConfigs(configs);
      
      // Set default LLM config if available
      const defaultConfig = configs.find(config => config.is_default);
      if (defaultConfig) {
        setFormData(prev => ({ ...prev, llm_config_id: defaultConfig.id }));
      }
    } catch (err) {
      console.error('Error fetching LLM configurations:', err);
      setError('Failed to load LLM configurations');
    } finally {
      setIsLoadingLlmConfigs(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Submit form
    setIsSubmitting(true);
    try {
      const newAgent = await apiClient.createAgent(formData);
      // Redirect to the agent's page
      router.push(`/agents/${newAgent.id}`);
    } catch (err: unknown) {
      console.error('Error creating agent:', err);
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors = {
      name: '',
      description: '',
      system_prompt: '',
      llm_config_id: '',
    };

    // Name is required
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Name cannot be longer than 100 characters';
    }

    // Description is optional but can't be too long
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description cannot be longer than 500 characters';
    }

    // System prompt is optional but can't be too long
    if (formData.system_prompt && formData.system_prompt.length > 2000) {
      errors.system_prompt = 'System prompt cannot be longer than 2000 characters';
    }

    setFormErrors(errors);
    return !Object.values(errors).some(error => error); // Return true if no errors
  };
  
  // Redirect to login if not authenticated
  if (!isLoadingAuth && !user) {
    router.push('/login');
    return null;
  }

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <SidebarLayout>
      <div className="flex flex-col h-full">
        <PageHeader 
          title="Create New Agent" 
          description="Configure your AI agent's settings"
          showBackButton
          backButtonLabel="Back to Agents"
          backButtonHref="/agents"
        />
        
        <div className="p-6 flex-grow overflow-y-auto">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-md bg-error/10 text-error text-sm border border-error/20">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary">
                    Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 bg-input-bg border border-input-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20"
                    placeholder="Enter agent name"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-sm text-error">{formErrors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-text-primary">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full px-4 py-2 bg-input-bg border border-input-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20"
                    placeholder="Describe what this agent does"
                  />
                  {formErrors.description && (
                    <p className="text-sm text-error">{formErrors.description}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="llm_config_id" className="block text-sm font-medium text-text-primary">
                    LLM Configuration
                  </label>
                  <select
                    id="llm_config_id"
                    name="llm_config_id"
                    value={formData.llm_config_id || ''}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 bg-input-bg border border-input-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="">Select LLM Configuration</option>
                    {isLoadingLlmConfigs ? (
                      <option disabled>Loading configurations...</option>
                    ) : (
                      llmConfigs.map(config => (
                        <option key={config.id} value={config.id}>
                          {config.provider} - {config.model_name} {config.is_default ? '(Default)' : ''}
                        </option>
                      ))
                    )}
                  </select>
                  {formErrors.llm_config_id && (
                    <p className="text-sm text-error">{formErrors.llm_config_id}</p>
                  )}
                  <p className="text-xs text-text-secondary">
                    Choose which LLM (Claude, GPT-4, etc.) this agent will use.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="system_prompt" className="block text-sm font-medium text-text-primary">
                    System Prompt
                  </label>
                  <textarea
                    id="system_prompt"
                    name="system_prompt"
                    value={formData.system_prompt || ''}
                    onChange={handleChange}
                    rows={5}
                    className="block w-full px-4 py-2 bg-input-bg border border-input-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono text-sm"
                    placeholder="Enter system instructions for this agent"
                  />
                  {formErrors.system_prompt && (
                    <p className="text-sm text-error">{formErrors.system_prompt}</p>
                  )}
                  <p className="text-xs text-text-secondary">
                    The system prompt defines your agent&apos;s personality and capabilities. It&apos;s the initial instruction given to the AI.
                  </p>
                </div>
                
                <div className="pt-4 flex items-center justify-end space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push('/agents')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 px-4"
                  >
                    {!isSubmitting && (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor" 
                        className="w-4 h-4"
                      >
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                      </svg>
                    )}
                    Create Agent
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
} 