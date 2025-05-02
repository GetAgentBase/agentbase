-- Script to reset API keys and LLM configurations
-- This will delete existing API keys and LLM configurations
-- You'll need to re-add your API keys after running this

-- Set all agents to use no LLM configuration (do this first to avoid foreign key constraint)
UPDATE agents SET llm_config_id = NULL;

-- Delete LLM configurations (they reference API keys)
DELETE FROM llm_configs;

-- Delete API keys
DELETE FROM api_keys;

-- List remaining agents (for reference)
SELECT id, name FROM agents; 