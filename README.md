# Team Productivity Platform

![CI Status](https://github.com/tu-usuario/repo/actions/workflows/ci.yml/badge.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D20-green)
![License](https://img.shields.io/badge/license-MIT-blue)

A production-ready Enterprise MVP for team management and productivity tracking. This platform implements a **Backend-for-Frontend (BFF)** architecture using **NestJS** (Backend) and **Next.js** (Frontend), focusing on Clean Architecture, Domain-Driven Design (DDD), and robust security practices.

---

## 🛠 Tech Stack & Architecture

### Backend (`/bff-nestjs`)

- **Framework:** NestJS (Modular Architecture)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM (with Soft Delete Middleware)
- **Auth:** JWT (Access + Refresh Tokens) with HttpOnly Cookies
- **Queueing:** Abstracted Queue Service (Supports Redis & In-Memory for local dev)
- **Testing:** Jest (Unit) + Supertest (E2E)

### Frontend (`/frontend-nextjs`)

- **Framework:** Next.js 14 (App Router)
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios (with Interceptors for auto-refresh token flow)

### Enterprise Patterns

- **Role-Based Access Control (RBAC):** Guards for Admin, Manager, and User roles.
- **Data Integrity:** Transactional consistency and Soft Deletes.
- **Security:** Helmet, CORS, Rate Limiting, and strict input validation (DTOs).

---

## 🚀 Quickstart (Local Development)

### Prerequisites

- Node.js (v20+)
- PostgreSQL (Local instance or Docker container)
- _(Optional)_ Redis (Platform falls back to In-Memory queue if Redis is missing)

### 1. Clone & Setup

```bash
git clone <repository-url>
cd team-productivity-platform

Backend Setup

Bash
cd bff-nestjs

# Install dependencies
npm install

# Configure Environment
cp .env.example .env
# UPDATE .env with your local DB credentials!
# Ensure QUEUE_DRIVER=memory if you don't have Redis running.

# Run Migrations & Seed Data
npm run migrate
npm run seed
3. Frontend Setup

Bash
cd ../frontend-nextjs

# Install dependencies
npm install

# Configure Environment
cp .env.local.example .env.local

# Start Development Server
npm run dev
4. Access the App

Open http://localhost:3000 in your browser.

🔑 Demo Accounts
The database is seeded with the following accounts for demonstration purposes:

Role	Email	Password	Access Level
Admin	admin@demo.local	Password123	Full System Access
Manager	manager@demo.local	Password123	Team Management
User	user@demo.local	Password123	Task Execution
🧪 Testing Strategy
The project includes a comprehensive E2E test suite covering critical user flows.

Bash
# Run E2E Tests (Backend)
cd bff-nestjs
npm run test:e2e
Coverage:

Auth: Registration, Login, Token Refresh.

Teams: Creation, Invitations, Role assignment.

Tasks: CRUD operations, Status transitions.

📂 Project Structure
.
├── bff-nestjs/             # Backend Application
│   ├── src/
│   │   ├── common/         # Shared Guards, Decorators, Filters
│   │   ├── modules/        # Feature Modules (Auth, Users, Teams, Tasks)
│   │   └── providers/      # Infrastructure (Prisma, Queue, Mail)
│   └── test/               # End-to-End Tests
│
├── frontend-nextjs/        # Frontend Application
│   ├── src/
│   │   ├── app/            # Next.js App Router Pages
│   │   ├── components/     # Reusable UI Components
│   │   └── stores/         # Zustand State Stores
│   └── public/
│
└── README.md               # You are here

📜 License
This project is licensed under the MIT License.
```
