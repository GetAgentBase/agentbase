'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';
import { Agent } from '@/types/api';
import ChatInterface from '@/components/chat/ChatInterface';

export default function AgentDetailsPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch agent details
  useEffect(() => {
    async function fetchAgentDetails() {
      try {
        setIsLoading(true);
        const data = await apiClient.getAgent(agentId);
        setAgent(data);
      } catch (err) {
        setError('Failed to load agent details');
        console.error('Error fetching agent details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user && agentId) {
      fetchAgentDetails();
    }
  }, [user, agentId]);

  // Handle delete button click
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        await apiClient.deleteAgent(agentId);
        router.push('/agents');
      } catch (err) {
        setError('Failed to delete agent');
        console.error('Error deleting agent:', err);
      }
    }
  };
  
  // Redirect to login if not authenticated
  if (!isLoadingAuth && !user) {
    router.push('/login');
    return null;
  }

  if (isLoadingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="text-center">
              <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {error || 'Agent not found'}
              </p>
              <button 
                className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 shadow-sm h-9 px-4 py-2 text-sm"
                onClick={() => router.push('/agents')}
              >
                Back to Agents
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Agents</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage your AI agents</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 shadow-sm h-8 px-3 text-xs"
              onClick={() => router.push('/agents')}
            >
              ← Back to Agents
            </button>
            <button 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 px-4 py-2 text-white rounded-md text-sm font-medium"
              onClick={() => router.push('/agents/create')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-4 h-4"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Create Agent
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{agent.name}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/agents/${agent.id}/edit`)}
                className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 h-8 px-3 text-xs"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:pointer-events-none disabled:opacity-50 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 h-8 px-3 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Agent ID</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{agent.id}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(agent.created_at).toLocaleString()}
                </dd>
              </div>
              
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {agent.description || 'No description provided'}
                </dd>
              </div>
              
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">System Prompt</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md whitespace-pre-wrap font-mono">
                  {agent.system_prompt || 'No system prompt specified'}
                </dd>
              </div>
            </dl>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Chat with Agent</h3>
              <ChatInterface agentId={agent.id} agentName={agent.name} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 