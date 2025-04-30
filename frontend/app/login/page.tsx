'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';
import { LoginFormData } from '@/types/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const errors = {
      username: '',
      password: '',
    };
    
    if (!formData.username) {
      errors.username = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.username)) {
      errors.username = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await login(formData);
      router.push('/dashboard');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed');
    }
  };
  
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account to continue"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          id="username"
          name="username"
          type="email"
          label="Email address"
          autoComplete="email"
          value={formData.username}
          onChange={handleChange}
          required
          error={formErrors.username}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />
        
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          required
          error={formErrors.password}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        
        {authError && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            {authError}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <Link href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Forgot password?
            </Link>
          </div>
        </div>
        
        <div>
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full flex justify-center"
            size="lg"
          >
            Sign in
          </Button>
        </div>
        
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account yet?{' '}
            <Link href="/setup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Initial Setup
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
} 