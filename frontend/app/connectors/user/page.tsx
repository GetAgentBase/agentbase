'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';
import { UserConnector, SetupStatus } from '@/types/api';
import SidebarLayout from '@/components/ui/SidebarLayout';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { FiSettings, FiTrash2, FiLink, FiCheck, FiAlertTriangle, FiSearch, FiRefreshCw, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SetupWalkthroughModal from '@/components/connectors/SetupWalkthroughModal';

// Connector icon mapping with local image files
const ConnectorIconMap: Record<string, React.ReactNode> = {
  'Gmail': <Image src="/gmail.png" alt="Gmail" width={28} height={28} />,
  'Google Calendar': <Image src="/calendar.png" alt="Google Calendar" width={28} height={28} />,
  'Web Search': <Image src="/web.png" alt="Web Search" width={28} height={28} />
};

export default function UserConnectorsPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const [userConnectors, setUserConnectors] = useState<UserConnector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch user connectors
  useEffect(() => {
    async function fetchUserConnectors() {
      try {
        setIsLoading(true);
        const response = await apiClient.getUserConnectors(true);
        setUserConnectors(response.connectors || []);
      } catch (err) {
        setError('Failed to load your connectors');
        console.error('Error fetching user connectors:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchUserConnectors();
    }
  }, [user]);
  
  // Filter connectors by search query
  const filteredConnectors = userConnectors.filter(connector => 
    connector.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
          title="My Connectors" 
          description="Manage your connected services and data sources"
        />
        
        <div className="px-6 py-4 border-b border-border bg-card-secondary/30">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            {/* Search bar */}
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search your connectors..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Add new connector button */}
            <button
              onClick={() => router.push('/connectors')}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiPlus size={16} />
              Add New Connector
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
          {error && (
            <div className="p-3 mb-4 rounded-md bg-error/10 text-error text-sm border border-error/20">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <LoadingState />
          ) : filteredConnectors.length === 0 ? (
            <NoConnectorsState query={searchQuery} router={router} />
          ) : (
            <ConnectorGrid connectors={filteredConnectors} onUpdate={() => {
              // Refresh the list after an update
              setIsLoading(true);
              apiClient.getUserConnectors(true).then(response => {
                setUserConnectors(response.connectors || []);
                setIsLoading(false);
              }).catch(err => {
                console.error('Error refreshing connectors:', err);
                setIsLoading(false);
              });
            }} />
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

// Loading state component
function LoadingState() {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin h-10 w-10 border-3 border-primary rounded-full border-t-transparent mb-4"></div>
      <p className="text-text-secondary text-lg">Loading your connectors...</p>
    </div>
  );
}

// No connectors state component
interface NoConnectorsStateProps {
  query: string;
  router: ReturnType<typeof useRouter>;
}

function NoConnectorsState({ query, router }: NoConnectorsStateProps) {
  return (
    <div className="text-center py-12 bg-card-secondary/20 rounded-xl border border-border/50">
      <FiLink className="mx-auto text-text-secondary/50 mb-3" size={48} />
      {query ? (
        <>
          <h3 className="text-xl font-medium text-text-primary mb-2">No matching connectors</h3>
          <p className="text-text-secondary">No results matching &quot;<span className="font-medium">{query}</span>&quot;</p>
        </>
      ) : (
        <>
          <h3 className="text-xl font-medium text-text-primary mb-2">No connectors yet</h3>
          <p className="text-text-secondary mb-6">You haven't connected any external services yet</p>
          <button
            onClick={() => router.push('/connectors')}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <FiPlus size={16} />
            Add Your First Connector
          </button>
        </>
      )}
    </div>
  );
}

// Connector grid component
interface ConnectorGridProps {
  connectors: UserConnector[];
  onUpdate: () => void;
}

function ConnectorGrid({ connectors, onUpdate }: ConnectorGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {connectors.map((connector, index) => (
        <motion.div
          key={connector.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.08,
            ease: [0.25, 0.1, 0.25, 1] 
          }}
        >
          <UserConnectorCard connector={connector} onUpdate={onUpdate} />
        </motion.div>
      ))}
    </div>
  );
}

// User connector card component
interface UserConnectorCardProps {
  connector: UserConnector;
  onUpdate: () => void;
}

function UserConnectorCard({ connector, onUpdate }: UserConnectorCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  
  // Get connector icon or fallback
  const getConnectorIcon = (name: string) => {
    if (!connector.connector_type) return <FiLink className="text-gray-400" size={28} />;
    return ConnectorIconMap[connector.connector_type.name] || <FiLink className="text-gray-400" size={28} />;
  };
  
  // Get status badge
  const getStatusBadge = (status: SetupStatus) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100/80 text-green-700 border border-green-200">
            <FiCheck size={12} />
            <span>Active</span>
          </div>
        );
      case 'needs_setup':
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100/80 text-blue-700 border border-blue-200">
            <FiSettings size={12} />
            <span>Needs Setup</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-error/10 text-error border border-error/20">
            <FiAlertTriangle size={12} />
            <span>Error</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Handle delete connector
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.deleteUserConnector(connector.id);
      setShowDeleteModal(false);
      onUpdate();
    } catch (error) {
      console.error('Error deleting connector:', error);
      alert(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle setup completion
  const handleSetupComplete = async () => {
    // In a real implementation, we would update the connector status here
    console.log('Setup completed for connector:', connector.id);
    // Refresh connector list
    onUpdate();
  };
  
  return (
    <>
      <Card className="h-full overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200 bg-card">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Card header with icon and status */}
          <div className="px-6 pt-6 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center w-14 h-14 shadow-sm">
                {getConnectorIcon(connector.name)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{connector.name}</h3>
                <div className="flex items-center mt-1 text-xs text-text-secondary">
                  {connector.connector_type && (
                    <>
                      <span className="capitalize">{connector.connector_type.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div>
              {getStatusBadge(connector.setup_status as SetupStatus)}
            </div>
          </div>
          
          {/* Card body */}
          <div className="px-6 py-4 flex-grow min-h-[80px]">
            {connector.connector_type ? (
              <p className="text-sm text-text-secondary">{connector.connector_type.description}</p>
            ) : (
              <p className="text-sm text-text-secondary">A custom connector instance.</p>
            )}
          </div>
          
          {/* Card footer with actions */}
          <div className="px-6 py-4 mt-auto flex justify-between items-center bg-card-secondary/20 border-t border-border">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-2 text-sm font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <FiTrash2 size={14} />
              Remove
            </button>
            
            {connector.setup_status === 'needs_setup' ? (
              <button
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                onClick={() => setShowSetupModal(true)}
              >
                <FiSettings size={16} />
                Configure
              </button>
            ) : connector.setup_status === 'error' ? (
              <button
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                onClick={() => setShowSetupModal(true)}
              >
                <FiRefreshCw size={16} />
                Retry
              </button>
            ) : (
              <button
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                onClick={() => alert('Settings coming soon!')}
              >
                <FiSettings size={16} />
                Settings
              </button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-3">Remove Connector</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to remove "{connector.name}"? This will also remove it from any agents using it.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-md bg-card-secondary hover:bg-card-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={16} />
                    Remove Connector
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Setup Walkthrough Modal */}
      {showSetupModal && connector.connector_type && (
        <SetupWalkthroughModal
          connectorName={connector.connector_type.name}
          onClose={() => setShowSetupModal(false)}
          onComplete={handleSetupComplete}
        />
      )}
    </>
  );
} 