# EZPG - Payment Gateway Platform

A comprehensive payment gateway platform built with modern web technologies, designed to manage virtual account transactions for merchants in the Korean financial ecosystem.

## 🏢 Overview

EZPG is a full-stack payment gateway solution that facilitates virtual account transactions between merchants and their customers. The platform provides secure, scalable payment processing with comprehensive admin controls, merchant dashboards, and real-time transaction monitoring.

### Key Features

- **Virtual Account Management** - Dynamic and static virtual account generation
- **Multi-Merchant Support** - Comprehensive merchant onboarding and management
- **Real-time Transactions** - Live deposit, withdrawal, and settlement processing
- **Admin Dashboard** - Complete administrative control and monitoring
- **Merchant Portal** - Self-service merchant dashboard
- **Agent System** - Multi-level agent distribution and commission management
- **Financial Reporting** - Detailed transaction analytics and reporting
- **API Integration** - RESTful APIs with OpenAPI documentation
- **Security Features** - JWT authentication, 2FA support, role-based access control

## 🏗️ Architecture

This is a Turborepo monorepo containing:

### Applications (`apps/`)

- **`server`** - NestJS backend API server (Port 8080)
- **`admin`** - Next.js admin dashboard (Port 3000)
- **`merchant`** - Next.js merchant portal (Port 3001)

### Packages (`packages/`)

- **`database`** - Prisma schema and database utilities
- **`api-client`** - Auto-generated TypeScript API client
- **`ui`** - Shared React component library with Radix UI
- **`types`** - Shared TypeScript type definitions
- **`auth`** - Authentication utilities and JWT helpers
- **`hooks`** - Shared React hooks
- **`schemas`** - Zod validation schemas
- **`helpers`** - Utility functions and helpers
- **`config`** - Shared configuration files
- **`eslint-config`** - ESLint configuration
- **`typescript-config`** - TypeScript configuration

## 🚀 Tech Stack

### Backend
- **NestJS** - Enterprise Node.js framework
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **OTPLIB** - Two-factor authentication

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form handling
- **TanStack Query** - Data fetching and caching
- **Zod** - Schema validation

### DevOps & Tooling
- **Turborepo** - Monorepo build system
- **Yarn** - Package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## 📋 Prerequisites

- **Node.js** >= 18.17.0 or >= 20.0.0
- **Yarn** >= 1.22.22
- **PostgreSQL** >= 13
- **Git**

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ezpg
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   
   Copy the environment files and configure them:
   ```bash
   cp apps/server/.env.example apps/server/.env
   ```
   
   Configure your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ezpg"
   
   # JWT
   JWT_SECRET="your-jwt-secret"
   REFRESH_TOKEN_SECRET="your-refresh-token-secret"
   
   # Other configurations...
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   yarn prisma:generate
   
   # Run database migrations
   yarn prisma:migrate:reset
   
   # Seed the database (optional)
   yarn db:reset-seed
   ```

5. **Generate API Client**
   ```bash
   yarn generate:api
   ```

## 🏃‍♂️ Development

Start all applications in development mode:

```bash
yarn dev
```

This will start:
- **Server API**: http://localhost:8080
- **Admin Dashboard**: http://localhost:3000
- **Merchant Portal**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555 (if enabled)

### Individual Commands

```bash
# Build all apps and packages
yarn build

# Run linting
yarn lint

# Fix linting issues
yarn lint:fix

# Format code
yarn format

# Run tests
yarn test

# Clean build artifacts
yarn clean

# Database operations
yarn prisma:studio          # Open Prisma Studio
yarn prisma:migrate:reset   # Reset and migrate database
yarn db:reset-seed         # Reset database with seed data
```

## 📊 Database Schema

The platform uses PostgreSQL with Prisma ORM. Key entities include:

### Core Entities
- **Users** - System users (admins, merchants, agents)
- **Merchants** - Payment gateway clients
- **VirtualAccounts** - Dynamic/static virtual accounts
- **Transactions** - Deposit/withdrawal records
- **Agents** - Distribution network management

### Financial Entities
- **MerchantWallet** - Merchant balance management
- **MerchantFee** - Fee structure configuration
- **Remittance** - Settlement transactions
- **BalanceLogs** - Financial audit trail

### Administrative
- **Roles** - Role-based access control
- **Logs** - System audit logs
- **Notices** - System announcements
- **Blacklist** - Security management

## 🔐 Authentication & Security

- **JWT-based authentication** with refresh tokens
- **Role-based access control** (Admin, Merchant, Agent)
- **Two-factor authentication** support
- **Password hashing** with bcrypt
- **API key management** for merchant integrations
- **IP whitelisting** for callback URLs

## 📡 API Documentation

The API is documented using OpenAPI/Swagger specification. Once the server is running, you can access:

- **API Documentation**: http://localhost:8080/api/docs
- **OpenAPI Spec**: http://localhost:8080/api/docs-json

## 🏢 Business Features

### Merchant Management
- Merchant onboarding with KYC
- Virtual account allocation
- Fee structure configuration
- Balance and settlement management
- Transaction limits and controls

### Transaction Processing
- Real-time deposit processing
- Automated settlement workflows
- Multi-currency support (KRW focus)
- Transaction status tracking
- Reconciliation and reporting

### Agent Network
- Multi-level distribution system
- Commission rate management
- Agent performance tracking
- Territory management

### Compliance & Reporting
- Financial audit trails
- Regulatory compliance reporting
- Transaction monitoring
- Risk management tools

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation for integration help

---

**Note**: This is a Korean financial services platform. Ensure compliance with local regulations and financial requirements when deploying to production.
