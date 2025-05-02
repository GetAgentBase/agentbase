import uuid
from sqlalchemy import (
    create_engine, Column, String, DateTime, Boolean, ForeignKey, JSON,
    UniqueConstraint, Index, TIMESTAMP, Text
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)  # Analogous to Django's superuser/staff status
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    llm_configs = relationship("LLMConfig", back_populates="user", cascade="all, delete-orphan")
    agents = relationship("Agent", back_populates="user", cascade="all, delete-orphan")
    configured_tools = relationship("ConfiguredTool", back_populates="user", cascade="all, delete-orphan")
    log_entries = relationship("LogEntry", back_populates="user", cascade="all, delete-orphan")
    user_connectors = relationship("UserConnector", back_populates="user", cascade="all, delete-orphan")

class APIKey(Base):
    __tablename__ = 'api_keys'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    provider_name = Column(String, nullable=False, index=True)  # e.g., 'OpenAI', 'Anthropic'
    encrypted_key = Column(String, nullable=False)  # Store the encrypted key here
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="api_keys")

class LLMConfig(Base):
    __tablename__ = 'llm_configs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    provider = Column(String, nullable=False) # e.g., 'openai', 'anthropic'
    model_name = Column(String, nullable=False) # e.g., 'gpt-4-turbo', 'claude-3-opus'
    encrypted_credentials = Column(String, nullable=False) # Store encrypted API key, etc.
    is_default = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="llm_configs")
    agents = relationship("Agent", back_populates="llm_config")

class Agent(Base):
    __tablename__ = 'agents'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    llm_config_id = Column(UUID(as_uuid=True), ForeignKey('llm_configs.id'), nullable=True) # Can start null, link later
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    system_prompt = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="agents")
    llm_config = relationship("LLMConfig", back_populates="agents")
    agent_tool_links = relationship("AgentToolLink", back_populates="agent", cascade="all, delete-orphan")
    conversation_turns = relationship("ConversationTurn", back_populates="agent", cascade="all, delete-orphan")
    log_entries = relationship("LogEntry", back_populates="agent", cascade="all, delete-orphan")
    agent_connector_links = relationship("AgentConnectorLink", back_populates="agent", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint('user_id', 'name', name='uq_user_agent_name'),)

class Tool(Base):
    """Registry of available tool types"""
    __tablename__ = 'tools'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False) # e.g., 'web_search', 'gmail_reader', 'slack_poster'
    description = Column(Text, nullable=False)
    tool_type = Column(String, nullable=False) # 'builtin', 'api_key', 'oauth2', 'custom'
    config_schema = Column(JSON, nullable=True) # JSON Schema for configuration inputs
    execution_ref = Column(String, nullable=False) # Reference to implementation (e.g., function name, image)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    configured_tools = relationship("ConfiguredTool", back_populates="tool")
    user_connectors = relationship("UserConnector", back_populates="tool")

class UserConnector(Base):
    """User-specific connector instances"""
    __tablename__ = 'user_connectors'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    tool_id = Column(UUID(as_uuid=True), ForeignKey('tools.id'), nullable=False)
    name = Column(String, nullable=False)  # User-defined name (e.g., "My Work Gmail")
    setup_status = Column(String, nullable=False, default='needs_setup')  # needs_setup, active, error
    config_data = Column(JSON, nullable=True)  # User-specific configuration
    encrypted_credentials = Column(String, nullable=True)  # Encrypted OAuth tokens or API keys
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="user_connectors")
    tool = relationship("Tool", back_populates="user_connectors")
    agent_connector_links = relationship("AgentConnectorLink", back_populates="user_connector", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint('user_id', 'name', name='uq_user_connector_name'),)

class AgentConnectorLink(Base):
    """Links an Agent to a specific UserConnector instance"""
    __tablename__ = 'agent_connector_links'
    agent_id = Column(UUID(as_uuid=True), ForeignKey('agents.id'), primary_key=True)
    user_connector_id = Column(UUID(as_uuid=True), ForeignKey('user_connectors.id'), primary_key=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    agent = relationship("Agent", back_populates="agent_connector_links")
    user_connector = relationship("UserConnector", back_populates="agent_connector_links")

class ConfiguredTool(Base):
    """An instance of a Tool configured by a user"""
    __tablename__ = 'configured_tools'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    tool_id = Column(UUID(as_uuid=True), ForeignKey('tools.id'), nullable=False)
    name = Column(String, nullable=False) # User-defined name for this instance
    status = Column(String, default='active') # 'active', 'needs_config', 'error'
    config_data = Column(JSON, nullable=True) # User-specific config based on Tool.config_schema
    encrypted_credentials = Column(String, nullable=True) # Encrypted API key or OAuth tokens
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="configured_tools")
    tool = relationship("Tool", back_populates="configured_tools")
    agent_tool_links = relationship("AgentToolLink", back_populates="configured_tool", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint('user_id', 'name', name='uq_user_configured_tool_name'),)


class AgentToolLink(Base):
    """Links an Agent to a specific ConfiguredTool instance"""
    __tablename__ = 'agent_tool_links'
    agent_id = Column(UUID(as_uuid=True), ForeignKey('agents.id'), primary_key=True)
    configured_tool_id = Column(UUID(as_uuid=True), ForeignKey('configured_tools.id'), primary_key=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    agent = relationship("Agent", back_populates="agent_tool_links")
    configured_tool = relationship("ConfiguredTool", back_populates="agent_tool_links")


class ConversationTurn(Base):
    """Stores one turn of a conversation (user input or agent output/action)"""
    __tablename__ = 'conversation_turns'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey('agents.id'), nullable=False, index=True)
    # user_id? Could be useful if multiple users interact with same agent instance? For now, link to agent owner.
    role = Column(String, nullable=False) # 'user', 'agent', 'tool', 'system'
    content = Column(Text, nullable=True)
    tool_call_id = Column(String, nullable=True) # ID if this turn is part of a tool call sequence
    tool_name = Column(String, nullable=True) # Name of tool called/responded
    tool_input = Column(JSON, nullable=True) # Input passed to tool
    tool_output = Column(JSON, nullable=True) # Output received from tool
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)

    agent = relationship("Agent", back_populates="conversation_turns")

class LogEntry(Base):
    """Stores detailed operational logs"""
    __tablename__ = 'log_entries'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True, index=True) # Optional user context
    agent_id = Column(UUID(as_uuid=True), ForeignKey('agents.id'), nullable=True, index=True) # Optional agent context
    correlation_id = Column(String, index=True, nullable=True) # Link logs for a single request/run
    level = Column(String, default='INFO') # DEBUG, INFO, WARNING, ERROR
    message = Column(Text, nullable=False)
    details_json = Column(JSON, nullable=True) # Structured data (tool calls, errors, etc.)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="log_entries")
    agent = relationship("Agent", back_populates="log_entries") 