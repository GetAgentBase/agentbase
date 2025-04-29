<p align="center">
  <h1 align="center">AgentBase</h1>
  <p align="center">The Unified Infrastructure Platform for AI Agents</p>
</p>

<p align="center">
  <a href="https://github.com/agentbase/agentbase/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
</p>

## What is AgentBase?

AgentBase is an open-source platform that simplifies the development, deployment, and management of AI agents. 

We're doing for AI agents what [Supabase](https://github.com/supabase/supabase) did for backend services: unifying essential infrastructure components into a cohesive, developer-friendly platform. With AgentBase, you can focus on building intelligent agents instead of worrying about the underlying infrastructure.

## Key Features

- **Agent Runtimes** - Execute agent logic with any framework
- **Persistent Memory** - Store context and conversations
- **Tool Integration** - Connect agents to external services and APIs
- **Model Routing** - Use any AI model with your agents
- **Orchestration** - Create multi-agent workflows
- **Observability** - Monitor agent activity with detailed logs

## Quickstart

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (required for running AgentBase locally)
- [Git](https://git-scm.com/downloads) (for cloning the repository)

### Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/agentbase/agentbase.git
cd agentbase
```

### Running AgentBase

1.  **Configure Environment:** Copy the example environment file and **edit it** to set your secrets (database password, secret key):
    ```bash
    cp .env.example .env
    # Now edit .env with your text editor
    ```
2.  **Start Services:** Launch the platform using Docker Compose:
    ```bash
    docker-compose up -d
    ```
    This command reads the `docker-compose.yml` file, builds the container images (if not already built), and starts all the necessary services (Backend API, Database, Redis, Web Dashboard) in the background.

### Accessing the Dashboard

Once the services are running (wait a minute after `docker-compose up -d` for everything to initialize), open your browser and navigate to:

http://localhost:3000

You should see the basic AgentBase welcome page. The backend API health check should be available at `http://localhost:8000/health`.

### Next Steps (Phase 1)

The next phase involves:
- Initializing the platform via the Web Dashboard (creating the first admin user, setting up LLM keys).
- Using the `axis` CLI tool for interaction (`axis init`, `axis chat`, etc.).
- Creating and managing your first AI agents through the UI or CLI.

### Troubleshooting

- **Services not starting?** Make sure Docker is running on your system.
- **Port conflicts?** Check if other applications are using ports 3000 (frontend) or 8000 (backend).
- **Can't connect to dashboard?** Ensure all containers are running with `docker ps`.

## Project Status

- [x] Initial Planning
- [ ] Alpha
- [ ] Public Beta
- [ ] Production Ready

We're in the early stages of development. Star this repository to get updates!

## Coming Soon

- Web dashboard for agent management
- CLI for terminal-based workflows
- Example agents and integrations
- Comprehensive documentation

## Contributing

Interested in contributing? Check out our [Contributing Guide](./CONTRIBUTING.md) and our [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

AgentBase is licensed under the [MIT License](./LICENSE).

---

<p align="center">
  <i>AgentBase: Focus on your agents, not the infrastructure.</i>
</p>
