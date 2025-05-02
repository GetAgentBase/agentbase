/**
 * API types for the AgentBase application
 */

// Setup Types
export interface SetupFormData {
  email: string;
  password: string;
  api_key_provider: string;
  api_key_value: string;
}

export interface SetupResponse {
  message: string;
  user_id: string;
}

// Auth Types
export interface LoginFormData {
  username: string; // Email in our case
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at?: string;
}

// Status Types
export interface StatusResponse {
  setup_required: boolean;
}

// API Error
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

// API Key types
export interface APIKey {
  id: string;
  provider_name: string;
  masked_key: string;
  created_at?: string;
}

// LLM Config types
export interface LLMConfig {
  id: string;
  provider: string;
  model_name: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

// Agent types
export interface Agent {
  id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  llm_config_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentListResponse {
  agents: Agent[];
  count: number;
}

export interface AgentCreateRequest {
  name: string;
  description?: string;
  system_prompt?: string;
  llm_config_id?: string;
}

export interface AgentUpdateRequest {
  name?: string;
  description?: string;
  system_prompt?: string;
  llm_config_id?: string;
}

// Connector types
export type ConnectorType = 'builtin' | 'api_key' | 'oauth2' | 'custom';
export type ConnectorStatus = 'available' | 'coming_soon' | 'planned';

export interface Connector {
  id: string;
  name: string;
  description: string;
  tool_type: ConnectorType;
  config_schema?: any;
  execution_ref: string;
  status: ConnectorStatus;
}

export interface ConnectorList {
  connectors: Connector[];
  count: number;
}

// User Connector types
export type SetupStatus = 'needs_setup' | 'active' | 'error';

export interface UserConnector {
  id: string;
  name: string;
  user_id: string;
  tool_id: string;
  setup_status: SetupStatus;
  config_data?: any;
  created_at: string;
  updated_at: string;
  connector_type?: Connector; // Included when details are requested
}

export interface UserConnectorList {
  connectors: UserConnector[];
  count: number;
}

export interface UserConnectorCreate {
  name: string;
  tool_id: string;
  config_data?: any;
}

export interface UserConnectorUpdate {
  name?: string;
  config_data?: any;
  setup_status?: SetupStatus;
}

export interface ConnectorLinkResponse {
  agent_id: string;
  connector_id: string;
  message: string;
}

// Chat types
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content?: string;
  tool_call_id?: string;
  tool_name?: string;
  tool_input?: any;
  tool_output?: any;
  timestamp: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  count: number;
}

// Connector Walkthrough types
export interface ConnectorWalkthrough {
  name: string;
  auth_type: string;
  steps: Array<{
    title: string;
    description: string;
    instructions: string[];
    screenshot_url?: string;
  }>;
  troubleshooting: Array<{
    issue: string;
    solution: string;
  }>;
}

export interface ConnectorWalkthroughList {
  walkthroughs: Record<string, string>;
} 