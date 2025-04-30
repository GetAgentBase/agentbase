'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useApi from '@/lib/useApi';

export default function SetupPage() {
  const router = useRouter();
  const { loading, error, checkSetupStatus, submitSetup } = useApi();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    api_key_provider: 'OpenAI',
    api_key_value: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    api_key_provider: '',
    api_key_value: '',
  });
  
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);

  // Check if setup is required on load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkSetupStatus();
        console.log("Setup status response:", status);
        
        if (status) {
          setSetupRequired(status.setup_required);
          if (!status.setup_required) {
            console.log("Setup not required, should redirect to login");
            // If setup is not required, redirect to login after a brief delay to show results
            setTimeout(() => {
              router.push('/login');
            }, 1000);
          } else {
            console.log("Setup is required, staying on setup page");
          }
        }
      } catch (err) {
        console.error("Error checking setup status:", err);
      }
    };
    
    checkStatus();
  }, [checkSetupStatus, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
      confirmPassword: '',
      api_key_provider: '',
      api_key_value: '',
    };
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must include at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // API key provider validation
    if (!formData.api_key_provider) {
      errors.api_key_provider = 'API key provider is required';
    }
    
    // API key validation
    if (!formData.api_key_value) {
      errors.api_key_value = 'API key is required';
    } else if (formData.api_key_provider === 'OpenAI' && !formData.api_key_value.startsWith('sk-')) {
      errors.api_key_value = 'OpenAI API keys should start with "sk-"';
    }
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Extract only the data we need to send (exclude confirmPassword)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _, ...setupData } = formData;
      const response = await submitSetup(setupData);
      
      if (response) {
        // Setup was successful - mark as complete in local storage to inform middleware
        console.log("Setup successful, redirecting to login");
        
        // Add a delay to ensure the server has time to register the change
        setTimeout(() => {
          window.location.href = '/login?setup=success';
        }, 1500);
      }
    } catch (err) {
      console.error('Setup failed:', err);
    }
  };
  
  // Show loading state while checking if setup is required
  if (setupRequired === null) {
    return (
      <AuthLayout title="Checking setup status...">
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </AuthLayout>
    );
  }
  
  // If setup is not required, redirect handled by useEffect
  if (setupRequired === false) {
    return null;
  }
  
  return (
    <AuthLayout 
      title="Initial Setup" 
      subtitle="Create the administrator account and configure your first API key"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Admin Account Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Administrator Account</h3>
          
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={formErrors.email}
          />
          
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
            error={formErrors.password}
            helperText="Must be at least 8 characters with uppercase, lowercase, and numbers"
          />
          
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            error={formErrors.confirmPassword}
          />
        </div>
        
        {/* API Key Section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">API Configuration</h3>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              API Provider <span className="text-red-500">*</span>
            </label>
            <select
              id="api_key_provider"
              name="api_key_provider"
              value={formData.api_key_provider}
              onChange={handleChange}
              className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
              required
            >
              <option value="OpenAI">OpenAI</option>
              <option value="Anthropic">Anthropic</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.api_key_provider && (
              <p className="text-sm text-red-600 dark:text-red-400">{formErrors.api_key_provider}</p>
            )}
          </div>
          
          <Input
            id="api_key_value"
            name="api_key_value"
            type="password"
            label="API Key"
            value={formData.api_key_value}
            onChange={handleChange}
            required
            error={formErrors.api_key_value}
            helperText={formData.api_key_provider === 'OpenAI' ? 'Your OpenAI API key starting with "sk-"' : 'Your API key'}
          />
        </div>
        
        {error && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            {error.message || 'An error occurred during setup.'}
          </div>
        )}
        
        <div>
          <Button
            type="submit"
            isLoading={loading}
            className="w-full flex justify-center"
            size="lg"
          >
            Complete Setup
          </Button>
        </div>
        
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Already completed setup?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
} 