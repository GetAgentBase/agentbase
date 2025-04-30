'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';
import { Agent } from '@/types/api';
import SidebarLayout from '@/components/ui/SidebarLayout';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function AgentsPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch agents
  useEffect(() => {
    async function fetchAgents() {
      try {
        setIsLoadingAgents(true);
        const response = await apiClient.getAgents();
        setAgents(response?.agents || []);
      } catch (err) {
        setError('Failed to load agents');
        console.error('Error fetching agents:', err);
      } finally {
        setIsLoadingAgents(false);
      }
    }

    if (user) {
      fetchAgents();
    }
  }, [user]);

  // Handle creating a new agent
  const handleCreateAgent = () => {
    router.push('/agents/create');
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
          title="Agents" 
          description="Create and manage your AI agents"
          actions={
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleCreateAgent}
            >
              Create Agent
            </Button>
          }
        />
        
        <div className="p-6 flex-grow overflow-y-auto">
          {error && (
            <div className="p-3 mb-4 rounded-md bg-error/10 text-error text-sm border border-error/20">
              {error}
            </div>
          )}
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              {isLoadingAgents ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                  <p className="mt-2 text-text-secondary text-sm">Loading agents...</p>
                </div>
              ) : agents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left data-table">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Created</th>
                        <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((agent) => (
                        <tr key={agent.id} className="hover:bg-card-hover cursor-pointer" onClick={() => router.push(`/agents/${agent.id}`)}>
                          <td className="px-4 py-3 text-sm font-medium text-text-primary">
                            {agent.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary">
                            {agent.description || 'No description'}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary">
                            {new Date(agent.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="xs" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/agents/${agent.id}/edit`);
                                }}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="xs"
                                className="text-error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Are you sure you want to delete this agent?')) {
                                    apiClient.deleteAgent(agent.id).then(() => {
                                      setAgents(agents.filter(a => a.id !== agent.id));
                                    }).catch(err => {
                                      setError('Failed to delete agent');
                                      console.error('Error deleting agent:', err);
                                    });
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-secondary mb-4">You don&apos;t have any agents yet.</p>
                  <Button 
                    variant="primary"
                    onClick={handleCreateAgent}
                  >
                    Create Your First Agent
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
} 