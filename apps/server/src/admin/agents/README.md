# Admin Agents Module

This module provides functionality for managing agents in the admin panel. It includes features for creating, viewing,
updating, and deleting agents, as well as managing their balances.

## Features

- **Agent Management**: Create, read, update, and delete agents
- **Balance Management**: Deposit, withdraw, and adjust agent balances
- **Balance History**: View agent balance transaction history
- **Pagination and Filtering**: Support for paginated lists with filtering

## API Endpoints

| Method | Endpoint                          | Description                             |
| ------ | --------------------------------- | --------------------------------------- |
| GET    | /admin/agents                     | List agents with pagination & filtering |
| POST   | /admin/agents                     | Create a new agent                      |
| GET    | /admin/agents/:id                 | Get agent details                       |
| PATCH  | /admin/agents/:id                 | Update agent information                |
| DELETE | /admin/agents/:id                 | Delete (soft delete) an agent           |
| POST   | /admin/agents/:id/restore         | Restore a deleted agent                 |
| POST   | /admin/agents/:id/balance         | Update agent balance                    |
| GET    | /admin/agents/:id/balance/history | Get agent balance history               |

## Authentication and Authorization

All endpoints require authentication with either ADMIN or SUPER_ADMIN role.
Regular admins can only manage agents for merchants they created, while SUPER_ADMINs can manage all agents.

## Data Transfer Objects (DTOs)

- **CreateAgentDto**: Data for creating a new agent
- **UpdateAgentDto**: Data for updating an existing agent
- **AgentQueryDto**: Query parameters for listing agents
- **AgentResponseDto**: Response data for agent information
- **AgentBalanceUpdateDto**: Data for updating an agent's balance

## Implementation Details

The module follows a standard architecture:

- **Controller**: Handles HTTP requests
- **Service**: Implements business logic
- **DTOs**: Define data structures for requests and responses
- **Guards**: Ensure proper authentication and authorization

For more details, refer to the source code and inline documentation.
