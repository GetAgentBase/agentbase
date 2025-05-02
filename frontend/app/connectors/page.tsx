'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';
import { Connector, ConnectorStatus, ConnectorType } from '@/types/api';
import SidebarLayout from '@/components/ui/SidebarLayout';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { motion } from 'framer-motion';
import SetupWalkthroughModal from '@/components/connectors/SetupWalkthroughModal';

// Import React Icons (just the ones we need for UI elements)
import { FiCheck, FiClock, FiAlertCircle, FiTool, FiKey, FiLock, FiRefreshCw, FiSearch, FiPlus, FiLink } from 'react-icons/fi';

// Connector icon mapping with local image files
const ConnectorIconMap: Record<string, React.ReactNode> = {
  'Gmail': <Image src="/gmail.png" alt="Gmail" width={28} height={28} />,
  'Google Calendar': <Image src="/calendar.png" alt="Google Calendar" width={28} height={28} />,
  'Web Search': <Image src="/web.png" alt="Web Search" width={28} height={28} />
};

// Authentication type icons
const AuthTypeIconMap: Record<ConnectorType, React.ReactNode> = {
  'oauth2': <FiLock className="text-blue-400" size={16} />,
  'api_key': <FiKey className="text-amber-500" size={16} />,
  'builtin': <FiTool className="text-gray-500" size={16} />,
  'custom': <FiRefreshCw className="text-purple-500" size={16} />
};

// Expanded connector descriptions
const connectorDescriptions = {
  'Gmail': "Interacts with Gmail emails. Allows reading, sending, organizing, and managing your email communications securely and efficiently.",
  'Google Calendar': "Interacts with Google Calendar events. Enables viewing, creating, editing, and managing calendar appointments, meetings, and schedules.",
  'Web Search': "Searches the web for real-time information. Access up-to-date knowledge, news, and data from across the internet to enhance your agents with current information."
};

export default function ConnectorsPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConnectorStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch connectors
  useEffect(() => {
    async function fetchConnectors() {
      try {
        setIsLoading(true);
        const filter = statusFilter !== 'all' ? statusFilter : undefined;
        const response = await apiClient.getConnectors(filter);
        setConnectors(response.connectors || []);
      } catch (err) {
        setError('Failed to load connectors');
        console.error('Error fetching connectors:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchConnectors();
    }
  }, [user, statusFilter]);
  
  // Filter connectors by search query
  const filteredConnectors = connectors.filter(connector => 
    connector.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    connector.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group connectors by type
  const connectorsByType: Record<string, Connector[]> = filteredConnectors.reduce((acc, connector) => {
    const type = connector.tool_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(connector);
    return acc;
  }, {} as Record<string, Connector[]>);
  
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
          title={
            <div className="flex items-center gap-2">
              Connectors
              <InfoTooltip 
                content={
                  <div>
                    <h4 className="font-medium mb-1">Connectors vs Tools</h4>
                    <p className="mb-2">Connectors are integration points that allow agents to access external services and data sources.</p>
                    <p className="mb-2">Tools are the specific functionalities an agent can use, often powered by these connectors.</p>
                    <p>Example: A Gmail connector provides tools like &quot;send email&quot; and &quot;read inbox&quot;.</p>
                  </div>
                }
              />
            </div>
          } 
          description="Connect your agents to external services and data sources"
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
                placeholder="Search connectors..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              {/* Status filter buttons */}
              <div className="flex space-x-2">
                <StatusFilterButton
                  label="All"
                  value="all"
                  currentValue={statusFilter}
                  setStatusFilter={setStatusFilter}
                  icon={<FiTool size={16} />}
                />
                <StatusFilterButton
                  label="Available"
                  value="available"
                  currentValue={statusFilter}
                  setStatusFilter={setStatusFilter}
                  icon={<FiCheck size={16} />}
                />
                <StatusFilterButton
                  label="Planned"
                  value="planned" 
                  currentValue={statusFilter}
                  setStatusFilter={setStatusFilter}
                  icon={<FiAlertCircle size={16} />}
                />
              </div>
              
              {/* My Connectors button */}
              <button
                onClick={() => router.push('/connectors/user')}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-card hover:bg-card-hover text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <FiLink size={16} />
                My Connectors
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
          {error && (
            <div className="p-3 mb-4 rounded-md bg-error/10 text-error text-sm border border-error/20">
              {error}
            </div>
          )}
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 inline-flex p-1 bg-card-secondary/50 rounded-lg">
              <TabsTrigger value="all" className="rounded-md">All</TabsTrigger>
              {Object.keys(connectorsByType).map(type => {
                const typeLabel = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
                return (
                  <TabsTrigger key={type} value={type} className="rounded-md flex items-center gap-2">
                    {AuthTypeIconMap[type as ConnectorType]}
                    <span>{typeLabel}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            <TabsContent value="all">
              {isLoading ? (
                <LoadingState />
              ) : filteredConnectors.length === 0 ? (
                <NoResultsState query={searchQuery} />
              ) : (
                <ConnectorGrid connectors={filteredConnectors} />
              )}
            </TabsContent>
            
            {Object.entries(connectorsByType).map(([type, typeConnectors]) => (
              <TabsContent key={type} value={type}>
                {typeConnectors.length === 0 ? (
                  <NoResultsState query={searchQuery} />
                ) : (
                  <ConnectorGrid connectors={typeConnectors} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </SidebarLayout>
  );
}

// Status filter button component
interface StatusFilterButtonProps {
  label: string;
  value: ConnectorStatus | 'all';
  currentValue: ConnectorStatus | 'all';
  setStatusFilter: (value: ConnectorStatus | 'all') => void;
  icon: React.ReactNode;
}

function StatusFilterButton({ label, value, currentValue, setStatusFilter, icon }: StatusFilterButtonProps) {
  const isActive = value === currentValue;
  
  return (
    <button
      onClick={() => setStatusFilter(value)}
      className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-primary text-primary-foreground shadow-sm' 
          : 'bg-card hover:bg-card-hover text-text-secondary'
      }`}
    >
      <span className={`flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-75'}`}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

// Loading state component
function LoadingState() {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin h-10 w-10 border-3 border-primary rounded-full border-t-transparent mb-4"></div>
      <p className="text-text-secondary text-lg">Loading connectors...</p>
    </div>
  );
}

// No results state component
interface NoResultsStateProps {
  query: string;
}

function NoResultsState({ query }: NoResultsStateProps) {
  return (
    <div className="text-center py-12 bg-card-secondary/20 rounded-xl border border-border/50">
      <FiSearch className="mx-auto text-text-secondary/50 mb-3" size={48} />
      <h3 className="text-xl font-medium text-text-primary mb-2">No connectors found</h3>
      {query ? (
        <p className="text-text-secondary">No results matching &quot;<span className="font-medium">{query}</span>&quot;</p>
      ) : (
        <p className="text-text-secondary">Try changing your filters or check back later for new connectors</p>
      )}
    </div>
  );
}

// Connector grid component
interface ConnectorGridProps {
  connectors: Connector[];
}

function ConnectorGrid({ connectors }: ConnectorGridProps) {
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
          <ConnectorCard connector={connector} />
        </motion.div>
      ))}
    </div>
  );
}

// Connector card component
interface ConnectorCardProps {
  connector: Connector;
}

function ConnectorCard({ connector }: ConnectorCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [connectorName, setConnectorName] = useState('');
  const [connectedId, setConnectedId] = useState<string | null>(null);
  
  // Get connector icon or fallback
  const getConnectorIcon = (name: string) => {
    return ConnectorIconMap[name] || <FiTool className="text-gray-400" size={28} />;
  };
  
  // Get status badge
  const getStatusBadge = (status: ConnectorStatus) => {
    switch (status) {
      case 'available':
        return null;
      case 'coming_soon':
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100/80 text-blue-700 border border-blue-200">
            <FiClock size={12} />
            <span>Coming Soon</span>
          </div>
        );
      case 'planned':
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100/80 text-gray-700 border border-gray-200">
            <FiAlertCircle size={12} />
            <span>Planned</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Get expanded description
  const getDescription = (name: string) => {
    return connectorDescriptions[name as keyof typeof connectorDescriptions] || connector.description;
  };
  
  // Handle connect button click
  const handleConnect = () => {
    setConnectorName(`My ${connector.name}`);
    setShowConnectModal(true);
  };
  
  // Handle creating the user connector
  const handleCreateConnector = async () => {
    try {
      setIsConnecting(true);
      const result = await apiClient.createUserConnector({
        name: connectorName,
        tool_id: connector.id
      });
      
      // Close modal and show setup instructions for OAuth or API Key connectors
      setShowConnectModal(false);
      
      // Store the connected ID for later reference
      setConnectedId(result.id);
      
      // If this is an OAuth or API Key connector, show the setup walkthrough
      if (connector.tool_type === 'oauth2' || connector.tool_type === 'api_key') {
        setShowSetupModal(true);
      } else {
        // For builtin connectors, just show success message
        alert(`Connected to ${connector.name} successfully!`);
      }
    } catch (error) {
      console.error('Error connecting:', error);
      alert(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Handle setup completion
  const handleSetupComplete = () => {
    console.log(`Setup completed for connector: ${connectedId}`);
    // In a real implementation, we would refresh the connector list or update status
    alert(`Connected to ${connector.name} successfully!`);
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
                  {AuthTypeIconMap[connector.tool_type as ConnectorType]}
                  <span className="ml-1 capitalize">{connector.tool_type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            <div>
              {getStatusBadge(connector.status)}
            </div>
          </div>
          
          {/* Card body with description - consistent height */}
          <div className="px-6 py-4 flex-grow min-h-[80px]">
            <p className="text-sm text-text-secondary">{getDescription(connector.name)}</p>
          </div>
          
          {/* Card footer with action button */}
          <div className="px-6 py-4 mt-auto flex justify-end items-center bg-card-secondary/20 border-t border-border">
            {connector.status === 'available' ? (
              <button 
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                onClick={handleConnect}
              >
                <FiPlus size={16} />
                Connect
              </button>
            ) : (
              <button 
                disabled
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary/30 text-primary-foreground/80 cursor-not-allowed flex items-center gap-2"
              >
                {connector.status === 'coming_soon' ? (
                  <>
                    <FiClock size={16} />
                    Coming Soon
                  </>
                ) : (
                  <>
                    <FiAlertCircle size={16} />
                    Planned
                  </>
                )}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Connect to {connector.name}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name this connection</label>
              <input
                type="text"
                value={connectorName}
                onChange={(e) => setConnectorName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="e.g., My Work Gmail"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-md bg-card-secondary hover:bg-card-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConnector}
                disabled={!connectorName.trim() || isConnecting}
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary-foreground rounded-full border-t-transparent"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <FiPlus size={16} />
                    Connect
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Setup Walkthrough Modal */}
      {showSetupModal && (
        <SetupWalkthroughModal
          connectorName={connector.name}
          onClose={() => setShowSetupModal(false)}
          onComplete={handleSetupComplete}
        />
      )}
    </>
  );
}

// Helper explanation about connectors vs tools (info tooltip content)
/* 
Tools vs Connectors:
- Connectors are integration points that allow agents to access external services and data sources
- Tools are the specific functionalities an agent can use, often powered by these connectors
- A connector (like "Gmail") might provide multiple tools (like "send email", "read inbox")
*/ 