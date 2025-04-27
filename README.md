# AgentBase

<p align="center">
  <img src="https://your-logo-url-here.svg" alt="AgentBase" width="300" />
</p>

<p align="center">
  The Unified Infrastructure Platform for AI Agents.
</p>

<div align="center">
  <a href="https://github.com/agentbase/agentbase/actions"><img src="https://github.com/agentbase/agentbase/workflows/ci/badge.svg" alt="Build status" /></a>
  <a href="https://github.com/agentbase/agentbase/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License" /></a>
  <a href="https://discord.gg/agentbase"><img src="https://img.shields.io/discord/1000000000000000000?label=discord&logo=discord" alt="Discord" /></a>
  <a href="https://twitter.com/agentbase"><img src="https://img.shields.io/twitter/follow/agentbase?style=social" alt="Twitter" /></a>
</div>

## What is AgentBase?

AgentBase is an open-source platform that simplifies the development, deployment, and management of AI agents. Similar to how [Supabase](https://github.com/supabase/supabase) unified backend components for developers, AgentBase unifies the essential infrastructure for building capable, connected, and stateful AI agents.

The platform provides everything you need to create and manage AI agents:
- **Agent Runtimes** - Run agents built with any framework
- **Persistent Memory & Context** - Including vector storage for semantic recall
- **Tool Integration** - Connect agents to any service or API
- **Model Routing** - Use any AI model with your agents
- **Orchestration** - Create complex agent workflows
- **Authentication** - Secure access for users and tools
- **Comprehensive Observability** - Monitor everything your agents do

## Status

- [x] Alpha: We are testing AgentBase with a closed set of users
- [ ] Public Alpha: Anyone can sign up, but expect rough edges
- [ ] Public Beta: Stable for most non-enterprise use-cases
- [ ] Public: Production-ready

We are currently in Alpha. Watch "releases" of this repo to get notified of major updates.

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine

### Quick Start

```bash
# Clone the repository
git clone https://github.com/agentbase/agentbase.git

# Navigate to the project directory
cd agentbase

# Start all services with Docker Compose
docker-compose up -d

# Open the dashboard in your browser
open http://localhost:3000
```

Once running, follow the setup wizard in the dashboard to:
1. Create your admin account
2. Configure your first LLM provider
3. Create your first agent

### Using the CLI

AgentBase also provides a CLI for command-line management:

```bash
# Initialize AgentBase (first-time setup)
axis init

# Create a new agent
axis agent create my-first-agent

# Add a tool to your agent
axis agent tools add my-first-agent web-search

# Chat with your agent
axis chat my-first-agent
```

## Architecture

<p align="center">
  <img src="https://your-architecture-diagram-url-here.svg" alt="AgentBase Architecture" width="600" />
</p>

AgentBase consists of the following core components:

| Component | Description |
| --- | --- |
| **Web Dashboard** | User-friendly interface for managing agents, tools, logs, and configuration |
| **Backend API** | RESTful API for agent management, authentication, and tool execution |
| **Agent Runtime** | Executes agent logic, handles tool calls, and manages agent state |
| **Tool Registry** | Manages built-in and custom tool integrations |
| **Database** | Stores configuration, agent definitions, and execution logs |
| **Message Queue** | Manages asynchronous task execution (tool calls, etc.) |

## Features

### Agent Management

Create, configure, and deploy agents with an intuitive dashboard or CLI. AgentBase supports:

- Multiple agent runtimes
- Custom agent configuration
- Integration with existing code

### Tool Integration

Connect your agents to external services and APIs:

- Built-in tools (web search, etc.)
- OAuth-based integrations (Gmail, Slack, etc.)
- API-based integrations
- Custom tool development SDK

### Memory & Context

Give your agents persistent memory:

- Conversation history
- Vector storage for semantic search
- Structured data storage

### Observability

Monitor everything your agents do:

- Detailed logs with tool inputs/outputs
- Agent thought processes
- Performance metrics
- Error tracking

### Workflows

Build complex agent-powered workflows:

- Visual workflow builder
- Multi-step agent processes
- Conditional logic
- Triggers and scheduling

## Client Libraries

We're building client libraries in various languages. These SDKs give you type-safe access to your AgentBase data and agents.

| Repo                        | Official                                        | Community      |
| --------------------------- | ----------------------------------------------- | -------------- |
| **JavaScript/TypeScript**   | [agentbase-js](https://github.com/agentbase/agentbase-js)      | -              |
| **Python**                  | [agentbase-py](https://github.com/agentbase/agentbase-py)      | -              |

## Resources

- [Documentation](https://docs.agentbase.dev)
- [API Reference](https://docs.agentbase.dev/api)
- [Examples](https://github.com/agentbase/examples)
- [Discord](https://discord.gg/agentbase)
- [Twitter](https://twitter.com/agentbase)
- [Blog](https://agentbase.dev/blog)

## Contributing

We welcome contributions to AgentBase! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for more details.

### Developing Locally

To set up AgentBase for local development:

```bash
# Clone the repository
git clone https://github.com/agentbase/agentbase.git

# Navigate to the project directory
cd agentbase

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Start the services in development mode
docker-compose -f docker-compose.dev.yml up -d
```

## License

AgentBase is licensed under the [Apache 2.0 License](./LICENSE).

## Sponsors

We're looking for sponsors to support the development of AgentBase. If you're interested in sponsoring, please contact us at sponsors@agentbase.dev.

## Credits

- The AgentBase Team
- All our [Contributors](https://github.com/agentbase/agentbase/graphs/contributors)
- Inspired by [Supabase](https://github.com/supabase/supabase) and the amazing open-source community

---

<p align="center">
  <a href="https://agentbase.dev">
    <img src="https://your-badge-url-here.svg" alt="Built with AgentBase" width="200" />
  </a>
</p>
