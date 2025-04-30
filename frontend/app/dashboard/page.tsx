'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated (this is a fallback, should be handled by AuthGuard)
  if (!isLoading && !user) {
    router.push('/login');
    return null;
  }
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">AgentBase Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Welcome to AgentBase&apos;s dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">
            You&apos;re now logged in as {user?.is_superuser ? 'an administrator' : 'a user'}.
          </p>
          
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Agents</h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm">Create and manage your AI agents</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-100 dark:border-purple-800">
              <h3 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Tools</h3>
              <p className="text-purple-600 dark:text-purple-400 text-sm">Configure tools for your agents</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-100 dark:border-green-800">
              <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">API Keys</h3>
              <p className="text-green-600 dark:text-green-400 text-sm">Manage your API keys and credentials</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 