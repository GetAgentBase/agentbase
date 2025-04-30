'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';
import { APIKey } from '@/types/api';
import SidebarLayout from '@/components/ui/SidebarLayout';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function ApiKeysPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [error, setError] = useState('');
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    provider_name: 'OpenAI',
    api_key: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<APIKey | null>(null);
  const [isDeletingKey, setIsDeletingKey] = useState(false);
  const [affectedAgents, setAffectedAgents] = useState<number>(0);
  
  // Fetch API keys
  const fetchApiKeys = async () => {
    try {
      setIsLoadingKeys(true);
      const keys = await apiClient.getApiKeys();
      console.log('Fetched API keys:', keys);
      setApiKeys(keys || []);
    } catch (err) {
      setError('Failed to load API keys');
      console.error('Error fetching API keys:', err);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);
  
  // Handle view key details
  const handleViewKey = (key: APIKey) => {
    console.log('View button clicked for key:', key);
    setSelectedKey(key);
    setShowDetails(true);
  };
  
  // Handle close key details
  const handleCloseDetails = () => {
    console.log('Closing key details');
    setSelectedKey(null);
    setShowDetails(false);
  };

  // Handle new API key form submission
  const handleSubmitNewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKeyData.provider_name || !newKeyData.api_key) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await apiClient.createApiKey(newKeyData);
      await fetchApiKeys();
      setShowAddForm(false);
      setNewKeyData({
        provider_name: 'OpenAI',
        api_key: '',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add new API key';
      setError(errorMessage);
      console.error('Error adding API key:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewKeyData(prev => ({ ...prev, [name]: value }));
  };
  
  // Format masked key for better display
  const formatMaskedKey = (maskedKey: string): string => {
    // If the key starts with a prefix like "sk-", preserve it
    const prefixMatch = maskedKey.match(/^([a-zA-Z]+-[a-zA-Z])/);
    const prefix = prefixMatch ? prefixMatch[0] : '';
    
    // Get the last 4 characters if they're not dots
    const lastChars = maskedKey.slice(-4).replace(/•/g, '');
    
    // Return the formatted key with only 5 dots in the middle
    if (prefix && lastChars) {
      return `${prefix}•••••${lastChars}`;
    } else if (prefix) {
      return `${prefix}•••••`;
    } else if (lastChars) {
      return `•••••${lastChars}`;
    } else {
      return '•••••'; // Fallback if we can't format it nicely
    }
  };

  // Handle delete key confirmation dialog
  const handleDeleteKey = (key: APIKey) => {
    setKeyToDelete(key);
    // In a real implementation, we would fetch affected agents here
    // For now, simulate checking for affected agents with a random count 0-3
    setAffectedAgents(Math.floor(Math.random() * 4));
    setShowDeleteConfirm(true);
  };

  // Handle confirming key deletion
  const handleConfirmDelete = async () => {
    if (!keyToDelete) return;
    
    setIsDeletingKey(true);
    try {
      // This would be a real API call in the complete implementation
      // await apiClient.deleteApiKey(keyToDelete.id);
      console.log('Would delete API key:', keyToDelete.id);
      
      // Remove the key from the local state
      setApiKeys(keys => keys.filter(k => k.id !== keyToDelete.id));
      setShowDeleteConfirm(false);
      setKeyToDelete(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete API key';
      setError(errorMessage);
      console.error('Error deleting API key:', err);
    } finally {
      setIsDeletingKey(false);
    }
  };

  // Redirect to login if not authenticated
  if (!isLoadingAuth && !user) {
    router.push('/login');
    return null;
  }

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <SidebarLayout>
      <PageHeader 
        title="API Keys" 
        description="Manage your API provider keys and credentials"
        actions={
          <Button 
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            Add New API Key
          </Button>
        }
      />
      
      <div className="p-6">
        {error && (
          <div className="p-3 mb-4 rounded-md bg-error/10 text-error text-sm border border-error/20">
            {error}
          </div>
        )}
        
        {/* API Key Add Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New API Key</CardTitle>
              <Button 
                variant="ghost" 
                size="xs" 
                onClick={() => setShowAddForm(false)}
              >
                ×
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitNewKey}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="provider_name">
                    Provider
                  </label>
                  <select
                    id="provider_name"
                    name="provider_name"
                    value={newKeyData.provider_name}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 bg-input-bg border border-input-border rounded-md text-text-primary"
                    required
                  >
                    <option value="OpenAI">OpenAI</option>
                    <option value="Anthropic">Anthropic</option>
                  </select>
                </div>
                <div className="mb-4">
                  <Input
                    type="password"
                    id="api_key"
                    name="api_key"
                    value={newKeyData.api_key}
                    onChange={handleInputChange}
                    label="API Key"
                    placeholder="Enter your API key"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="mr-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Add Key
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingKeys ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
                <p className="mt-2 text-text-secondary">Loading API keys...</p>
              </div>
            ) : apiKeys.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-panel-border">
                      <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Provider</th>
                      <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Key</th>
                      <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Added</th>
                      <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr key={key.id.toString()} className="border-b border-panel-border">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                          {key.provider_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary font-mono">
                          {formatMaskedKey(key.masked_key)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                          {key.created_at ? new Date(key.created_at).toLocaleString() : 'Unknown'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Button 
                            variant="ghost" 
                            size="xs" 
                            className="mr-2"
                            onClick={() => handleViewKey(key)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="xs"
                            className="text-error"
                            onClick={() => handleDeleteKey(key)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">You don&apos;t have any API keys yet.</p>
                <Button onClick={() => setShowAddForm(true)}>
                  Add Your First API Key
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Key Details Modal */}
        {showDetails && selectedKey && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <div className="w-full max-w-md mx-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Key Details</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="xs" 
                    onClick={handleCloseDetails}
                  >
                    ×
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-text-secondary mb-1">Provider</p>
                    <p className="text-text-primary">{selectedKey.provider_name}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-text-secondary mb-1">Key (masked)</p>
                    <p className="text-text-primary font-mono">{formatMaskedKey(selectedKey.masked_key)}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-text-secondary mb-1">Added on</p>
                    <p className="text-text-primary">
                      {selectedKey.created_at 
                        ? new Date(selectedKey.created_at).toLocaleString() 
                        : 'Unknown'}
                    </p>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      className="mr-3"
                      onClick={handleCloseDetails}
                    >
                      Close
                    </Button>
                    <Button 
                      variant="danger"
                      onClick={() => {
                        handleDeleteKey(selectedKey);
                        handleCloseDetails();
                      }}
                    >
                      Delete Key
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && keyToDelete && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <div className="w-full max-w-md mx-4">
              <Card>
                <CardHeader>
                  <CardTitle>Delete API Key</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-primary mb-4">
                    Are you sure you want to delete this {keyToDelete.provider_name} API key?
                  </p>
                  
                  {affectedAgents > 0 && (
                    <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-md">
                      <p className="text-error">
                        Warning: {affectedAgents} agent{affectedAgents > 1 ? 's' : ''} will be affected by this deletion.
                        These agents will no longer be able to use this API key.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      className="mr-3"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="danger"
                      isLoading={isDeletingKey}
                      onClick={handleConfirmDelete}
                    >
                      Delete Key
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
} 