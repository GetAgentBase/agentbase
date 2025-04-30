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