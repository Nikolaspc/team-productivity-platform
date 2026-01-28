# Team Productivity Platform 🚀

[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![NestJS](https://img.shields.io/badge/backend-NestJS%2011-red?style=flat-square)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2016-black?style=flat-square)](https://nextjs.org/)
[![React](https://img.shields.io/badge/ui-React%2019-blue?style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript%205-blue?style=flat-square)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%2015-336791?style=flat-square)](https://www.postgresql.org/)

**Enterprise-grade SaaS platform** for team collaboration, project management, and task tracking. Built with a **Backend-for-Frontend (BFF)** architecture emphasizing security, data integrity, and real-time synchronization.

**Designed with German engineering standards:** Maximum reliability, privacy, and GDPR compliance.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Frontend Integration](#frontend-integration)
- [Real-time WebSockets](#real-time-websockets)
- [Data Model](#data-model)
- [Security Architecture](#security-architecture)
- [Background Jobs](#background-jobs)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Team Productivity Platform is a **full-stack SaaS application** that empowers teams to collaborate efficiently on projects and tasks. It combines a robust **NestJS backend** with a modern **Next.js frontend**, featuring:

- **Enterprise-Grade Security:** Argon2 password hashing, JWT + httpOnly cookies, RBAC
- **Real-Time Collaboration:** Socket.IO for instant notifications and team presence
- **Data Integrity:** Soft deletes, cascading transactions, complete audit trails
- **High Availability:** Async job processing with BullMQ, health checks, structured logging
- **Scalability:** Database connection pooling, Redis caching, stateless API design

---

## Key Features

### 🔐 Security & Authentication

| Feature               | Implementation                                                        |
| --------------------- | --------------------------------------------------------------------- |
| **Password Hashing**  | Argon2id (Password Hashing Competition winner)                        |
| **Token Strategy**    | Access Token (JWT, 15m) + Refresh Token (httpOnly cookie, 7d)         |
| **CORS Protection**   | Restrictive, frontend-only origin                                     |
| **Rate Limiting**     | 20 requests/60s per IP (configurable)                                 |
| **Role-Based Access** | USER → MANAGER → ADMIN (global); OWNER → MEMBER → VIEWER (team-level) |

### 📊 Team & Project Management

| Feature         | Details                                               |
| --------------- | ----------------------------------------------------- |
| **Teams**       | Create teams, invite members, manage roles            |
| **Projects**    | Organize work within teams with rich metadata         |
| **Tasks**       | Full lifecycle management (TODO → IN_PROGRESS → DONE) |
| **Assignments** | Assign tasks to team members with notifications       |
| **Invitations** | Email-based team invitations with expiration          |

### 🔄 Real-Time Features

| Capability                | Tech                                         |
| ------------------------- | -------------------------------------------- |
| **Live Updates**          | Socket.IO WebSocket server                   |
| **Task Events**           | taskCreated, taskUpdated, taskDeleted events |
| **User Presence**         | Track active users per project               |
| **Instant Notifications** | Browser toast notifications with Sonner      |

### 📁 File Management

| Feature           | Details                                        |
| ----------------- | ---------------------------------------------- |
| **Attachments**   | Upload files to tasks (PDF, images, documents) |
| **Cloud Storage** | Supabase Storage (S3-compatible)               |
| **Size Limits**   | 10MB max per file                              |
| **Metadata**      | Filename, MIME type, size tracked in DB        |

### 📈 Observability

| Component             | Implementation                      |
| --------------------- | ----------------------------------- |
| **Structured Logs**   | Pino JSON logging                   |
| **Metrics**           | Prometheus endpoint at `/metrics`   |
| **Health Checks**     | Terminus (PostgreSQL, Redis status) |
| **API Documentation** | Swagger/OpenAPI at `/api/docs`      |

### 🗑️ Data Compliance

| Aspect                | Approach                                        |
| --------------------- | ----------------------------------------------- |
| **Soft Deletes**      | Prisma extension—data never permanently lost    |
| **Cascading Cleanup** | Atomic transactions: Team → Projects → Tasks    |
| **Audit Trail**       | createdAt, updatedAt, deletedAt on all entities |
| **GDPR Ready**        | Data export, account deletion, consent tracking |

---

## Architecture

### System Overview

```
┌──────────────────────────┐
│   Browser / Client       │
└────────────┬─────────────┘
             │ HTTP/HTTPS + WebSocket
    ┌────────▼──────────┐
    │  Next.js 16       │
    │  Frontend         │
    │  (port 3000)      │
    └────────┬──────────┘
             │
    ┌────────▼──────────────────┐
    │  NestJS BFF (port 3001)   │
    │ • Auth + JWT              │
    │ • Teams, Projects, Tasks  │
    │ • WebSocket Gateway       │
    │ • Health + Metrics        │
    └────────┬──────────────────┘
             │
    ┌────────┴───────────┬────────────┐
    │                    │            │
    ▼                    ▼            ▼
┌─────────────┐  ┌───────────┐  ┌──────────────┐
│ PostgreSQL  │  │  Redis    │  │ Supabase S3  │
│ (port 5432)│  │ (port 6379)  │              │
│ Data Store  │  │ Cache+Jobs  │  File Storage│
└─────────────┘  └───────────┘  └──────────────┘
                      │
                      ▼
                ┌──────────────┐
                │ BullMQ Jobs  │
                │ Email Worker │
                └──────────────┘
```

### Authentication Flow

```
Login Form → Validation → Argon2 Check → JWT Generation
     ↓
Access Token (15m) returned
Refresh Token (7d) in httpOnly cookie
     ↓
Zustand Store: user + isAuthenticated
     ↓
Axios Interceptor: Authorization header
     ↓
NestJS Guard: Validate JWT + Role
     ↓
Resource Access ✅
```

---

## Tech Stack

### Backend (bff-nestjs/)

```json
{
  "core": {
    "nestjs": "11.0.0",
    "node": "18.x or 20.x LTS",
    "typescript": "5.7.0"
  },
  "database": {
    "prisma": "5.22.0",
    "postgresql": "15-alpine"
  },
  "authentication": {
    "@nestjs/jwt": "11.0.0",
    "@nestjs/passport": "11.0.0",
    "passport-jwt": "4.0.1",
    "argon2": "0.41.0"
  },
  "realtime": {
    "socket.io": "4.8.0",
    "@nestjs/websockets": "11.0.0"
  },
  "jobs": {
    "bullmq": "5.67.1",
    "@nestjs/bullmq": "11.0.4"
  },
  "observability": {
    "nestjs-pino": "4.5.0",
    "@willsoto/nestjs-prometheus": "6.0.0",
    "@nestjs/terminus": "11.0.0"
  },
  "mail": {
    "nodemailer": "6.9.0"
  },
  "storage": {
    "@aws-sdk/client-s3": "3.710.0"
  }
}
```

### Frontend (frontend-next/)

```json
{
  "framework": {
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "typescript": "5.x"
  },
  "state": {
    "zustand": "5.0.10"
  },
  "http": {
    "axios": "1.13.2"
  },
  "forms": {
    "react-hook-form": "7.71.1",
    "zod": "4.3.6"
  },
  "ui": {
    "@radix-ui/react-*": "latest",
    "tailwindcss": "4.x",
    "lucide-react": "0.563.0",
    "sonner": "2.0.7"
  }
}
```

### Infrastructure

| Component        | Version              |
| ---------------- | -------------------- |
| **Database**     | PostgreSQL 15-alpine |
| **Cache**        | Redis 7-alpine       |
| **Containers**   | Docker Compose 3.8   |
| **Node Runtime** | 18.x or 20.x LTS     |

---

## Requirements

### System Prerequisites

- **Node.js:** 18.x LTS or 20.x LTS
- **npm:** 9.x or higher
- **PostgreSQL:** 15+ (or Docker)
- **Redis:** 7+ (or Docker, recommended)
- **Git:** For version control

### Recommended

- **Docker & Docker Compose:** Simplest setup
- **VS Code:** With ESLint + Prettier extensions
- **Postman/Insomnia:** API testing

---

## Quick Start

### Option 1: Docker (Recommended) ⭐

```bash
# 1. Clone repository
git clone https://github.com/Nikolaspc/team-productivity-platform.git
cd team-productivity-platform

# 2. Create environment file
cp bff-nestjs/.env.example bff-nestjs/.env
# Defaults work for local development

# 3. Start all services
docker-compose up --build

# 4. In another terminal, run migrations
docker-compose exec tpp-bff npx prisma migrate deploy

# ✅ Access:
# Frontend:         http://localhost:3000
# Backend:          http://localhost:3001
# API Docs:         http://localhost:3001/api/docs
# Maildev:          http://localhost:1080
```

### Option 2: Local Development

```bash
# 1. Clone repository
git clone https://github.com/Nikolaspc/team-productivity-platform.git
cd team-productivity-platform

# 2. Backend setup
cd bff-nestjs
cp .env.example .env
npm ci
npx prisma migrate deploy

# Terminal 1: Start backend
npm run start:dev

# Terminal 2: Frontend setup
cd frontend-next
npm ci
npm run dev

# ✅ Access: http://localhost:3000
```

---

## Development Setup

### Environment Files

#### Backend (.env)

```bash
NODE_ENV=development
PORT=3001
FRONTEND_URL="http://localhost:3000"

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/productivity_db?schema=public"
DATABASE_POOL_SIZE=10

AT_SECRET="your-32-char-secret-here"
RT_SECRET="your-32-char-secret-here"
COOKIE_SECRET="your-32-char-secret-here"
AT_EXPIRES_IN="15m"
RT_EXPIRES_IN="7d"

REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
REDIS_PASSWORD=""

MAIL_HOST="smtp.ethereal.email"
MAIL_PORT=587
MAIL_USER="your-ethereal-email@ethereal.email"
MAIL_PASS="your-ethereal-password"
MAIL_FROM='"Team Productivity" <no-reply@app.local>'

STORAGE_ENDPOINT="https://your-project.storage.supabase.co/storage/v1/s3"
STORAGE_REGION="eu-central-1"
STORAGE_ACCESS_KEY="your-key"
STORAGE_SECRET_KEY="your-secret"
STORAGE_BUCKET="attachments"
STORAGE_FORCE_PATH_STYLE=true

THROTTLE_TTL=60000
THROTTLE_LIMIT=20
LOG_LEVEL="debug"
```

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Generate Secrets

```bash
# Generate three 32+ char secrets
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 32

# Add to .env AT_SECRET, RT_SECRET, COOKIE_SECRET
```

---

## Project Structure

### Backend

```
bff-nestjs/
├── src/
│   ├── auth/                        # JWT + Argon2
│   ├── modules/
│   │   ├── teams/                   # Team CRUD
│   │   ├── projects/                # Project CRUD
│   │   ├── tasks/                   # Task CRUD + WebSocket
│   │   ├── invitations/             # Email invites
│   │   ├── notifications/           # WebSocket gateway
│   │   ├── storage/                 # S3 uploads
│   │   ├── mail/                    # BullMQ processor
│   │   ├── dashboard/               # Analytics
│   │   └── health/                  # Health checks
│   ├── common/                      # Guards, decorators
│   ├── prisma/                      # DB service
│   └── main.ts                      # Bootstrap
├── prisma/
│   ├── schema.prisma                # Database schema
│   ├── migrations/                  # History
│   └── seed.ts                      # Test data
├── test/                            # E2E tests
└── package.json
```

### Frontend

```
frontend-next/
├── src/
│   ├── app/                         # Next.js 16 App Router
│   │   ├── auth/                    # Login/signup pages
│   │   └── dashboard/               # Protected area
│   ├── components/                  # React components
│   ├── store/                       # Zustand stores
│   ├── services/                    # API clients
│   ├── hooks/                       # Custom hooks
│   ├── types/                       # TypeScript types
│   ├── middleware.ts                # Route protection
│   └── globals.css                  # TailwindCSS
├── public/                          # Static files
└── package.json
```

---

## Environment Configuration

### Backend Variables

| Variable             | Purpose               | Example                  |
| -------------------- | --------------------- | ------------------------ |
| `NODE_ENV`           | Execution environment | development, production  |
| `PORT`               | Backend port          | 3001                     |
| `FRONTEND_URL`       | CORS whitelist        | http://localhost:3000    |
| `DATABASE_URL`       | PostgreSQL connection | postgresql://...         |
| `AT_SECRET`          | Access token secret   | (32+ chars)              |
| `RT_SECRET`          | Refresh token secret  | (32+ chars)              |
| `COOKIE_SECRET`      | Cookie signing secret | (32+ chars)              |
| `REDIS_HOST`         | Redis server          | 127.0.0.1                |
| `REDIS_PORT`         | Redis port            | 6379                     |
| `MAIL_HOST`          | SMTP server           | smtp.ethereal.email      |
| `MAIL_USER`          | SMTP username         | user@ethereal.email      |
| `MAIL_PASS`          | SMTP password         | (from ethereal)          |
| `STORAGE_ENDPOINT`   | S3 endpoint           | Supabase URL             |
| `STORAGE_ACCESS_KEY` | AWS access key        | (from Supabase)          |
| `STORAGE_SECRET_KEY` | AWS secret key        | (from Supabase)          |
| `THROTTLE_LIMIT`     | Rate limit requests   | 20 (per minute)          |
| `LOG_LEVEL`          | Logging level         | debug, info, warn, error |

### Frontend Variables

| Variable              | Purpose         | Example                      |
| --------------------- | --------------- | ---------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:3001/api/v1 |

---

## Authentication Flow

### Login Process

```typescript
// 1. User enters credentials
POST /auth/signin { email, password }
  ↓
// 2. Backend validates with Argon2
// 3. Generate tokens
  ↓
// 4. Return response with accessToken
Response: { user, accessToken }
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
  ↓
// 5. Frontend stores in Zustand
useAuthStore.setAuth(user, accessToken)
  ↓
// 6. Cookies auto-managed by browser
// 7. Subsequent requests include Authorization header
Authorization: Bearer <accessToken>
```

### Frontend Auth Store (Zustand)

```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

// Usage:
const { user, isAuthenticated, setAuth, logout } = useAuthStore();
```

### Token Refresh

```typescript
// Axios interceptor automatically handles:
// 1. If 401 response received
// 2. POST /auth/refresh with cookies
// 3. Get new accessToken
// 4. Retry original request
// 5. Update authStore
```

---

## API Endpoints

### Authentication

```http
POST /auth/signup
POST /auth/signin
POST /auth/refresh
```

### Teams

```http
GET /teams
GET /teams/:id
POST /teams
PUT /teams/:id
DELETE /teams/:id
POST /teams/:id/invitations
```

### Projects

```http
GET /projects?teamId=:teamId
GET /projects/:id
POST /projects
PUT /projects/:id
DELETE /projects/:id
```

### Tasks

```http
GET /tasks?projectId=:projectId&status=TODO
GET /tasks/:id
POST /tasks
PUT /tasks/:id
DELETE /tasks/:id
POST /tasks/:id/attachments
```

### System

```http
GET /health
GET /metrics
GET /api/docs
```

---

## Frontend Integration

### State Management (Zustand)

```typescript
// Example: Teams store
export const useTeamsStore = create((set) => ({
  teams: [],
  loading: false,

  fetchTeams: async () => {
    set({ loading: true });
    try {
      const response = await teamsService.getTeams();
      set({ teams: response });
    } catch (error) {
      toast.error('Failed to fetch teams');
    }
  },
}));

// Usage in component
const { teams } = useTeamsStore();
```

### Forms (React Hook Form + Zod)

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      <input {...register('password')} type="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

### UI Components (Radix + TailwindCSS)

```typescript
// Pre-built components with Radix UI + TailwindCSS
// Avatar, DropdownMenu, Label, Separator, Button, etc.
import { Avatar } from '@/components/ui/avatar';
```

### Notifications (Sonner)

```typescript
import { toast } from 'sonner';

// Success
toast.success('Task created!');

// Error
toast.error('Something went wrong');

// Info
toast.info('Task updated');
```

---

## Real-Time WebSockets

### Socket.IO Connection

```typescript
// services/socket.service.ts
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  auth: { token: accessToken },
  reconnection: true,
  reconnectionDelay: 1000,
});

socket.on('taskCreated', (data) => {
  toast.success(`Task: ${data.title}`);
});

socket.on('taskUpdated', (data) => {
  useTasksStore.getState().updateTask(data);
});
```

### Events

- `taskCreated` - New task notification
- `taskUpdated` - Task status changed
- `taskDeleted` - Task removed
- `userJoined` - User connected to project
- `userLeft` - User disconnected

---

## Data Model

### Core Entities

```
User (1) ──── (N) TeamMember ──── (1) Team
              |
              └── (N) Project
                  |
                  └── (N) Task ──── (?) User (assignee)
                      |
                      └── (N) Attachment

Invitation: Team + Email + Token (expires 7d)
```

### Key Tables

```sql
-- Users with roles
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE,
  password VARCHAR (Argon2),
  name VARCHAR,
  role ENUM('USER', 'MANAGER', 'ADMIN'),
  deletedAt TIMESTAMP -- Soft delete
);

-- Team membership with roles
CREATE TABLE "TeamMember" (
  id SERIAL PRIMARY KEY,
  userId INT REFERENCES "User",
  teamId INT REFERENCES "Team",
  role ENUM('OWNER', 'MEMBER', 'VIEWER'),
  UNIQUE(userId, teamId)
);

-- Task lifecycle
CREATE TABLE "Task" (
  id SERIAL PRIMARY KEY,
  title VARCHAR,
  status ENUM('TODO', 'IN_PROGRESS', 'DONE'),
  projectId INT REFERENCES "Project",
  assigneeId INT REFERENCES "User",
  dueDate TIMESTAMP,
  deletedAt TIMESTAMP -- Soft delete
);
```

---

## Security Architecture

### Password Hashing

```typescript
// Argon2id with enterprise parameters
hashPassword(password) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 65MB
    timeCost: 3,
    parallelism: 1,
  });
}
```

### JWT Strategy

```
Frontend: Authorization: Bearer <accessToken>
Backend:  Validates signature and expiration (15m)
          Issues new token if expired via refresh

Cookies:  HttpOnly, Secure, SameSite=Strict
          Browser auto-manages, JS cannot access
          Prevents XSS + CSRF attacks
```

### Rate Limiting

```
20 requests per 60 seconds per IP
Global guard applied: ThrottlerGuard
```

### RBAC

```
Global Roles: USER → MANAGER → ADMIN
Team Roles: OWNER → MEMBER → VIEWER
```

---

## Background Jobs

### Email Processing

```typescript
// Async job with BullMQ
queue.add('send-invitation', {
  email: 'user@example.com',
  teamName: 'Engineering',
}, {
  attempts: 3,           // Retry 3 times
  backoff: {
    type: 'exponential',
    delay: 2000,        // 2s, 4s, 8s...
  },
});

// Worker processes job
@Process('send-invitation')
async sendEmail(job: Job) {
  // Send via Nodemailer
}
```

---

## Testing

### Commands

```bash
# Backend
npm run test                # Unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage
npm run test:e2e           # E2E tests
npm run test:int           # Integration tests
```

---

## Deployment

### Docker Build

```bash
# Backend
docker build -t team-productivity-bff:latest -f bff-nestjs/Dockerfile .

# Frontend
docker build -t team-productivity-frontend:latest -f frontend-next/Dockerfile .
```

### Production Setup

1. Update environment variables (production values)
2. Build Docker images
3. Push to registry (ECR, DockerHub)
4. Deploy to orchestrator (Kubernetes, ECS, etc)
5. Run migrations: `npx prisma migrate deploy`

---

## Troubleshooting

### Cannot connect to PostgreSQL

```bash
# Check if database is running
docker-compose ps tpp-db

# Start database
docker-compose up -d tpp-db

# View logs
docker-compose logs tpp-db
```

### CORS error in browser

```bash
# Verify FRONTEND_URL in backend .env
FRONTEND_URL=http://localhost:3000

# Restart backend
docker-compose restart tpp-bff
```

### Tokens not persisting

```bash
# Check middleware.ts validates 'access_token'
# Verify cookie settings in authStore.ts
Cookies.set('access_token', token, {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  expires: 7,
});
```

### Database migrations fail

```bash
# Check migration status
npx prisma migrate status

# Reset (development only)
npx prisma migrate reset

# Manual fix
npx prisma db push --skip-generate
```

---

## Roadmap

### v0.1.0 (Current)

✅ Authentication (JWT + Argon2)  
✅ Teams, Projects, Tasks CRUD  
✅ Email invitations  
✅ WebSocket real-time  
✅ File attachments  
✅ Swagger API docs  
✅ Health checks

### v0.2.0

🔲 Task comments  
🔲 Dashboard analytics  
🔲 Advanced search  
🔲 Task templates

### v0.3.0

🔲 Slack integration  
🔲 GitHub integration  
🔲 Webhooks

### v0.4.0

🔲 Mobile app  
🔲 Offline support  
🔲 Workflow automation

---

## Scripts

### Backend

```bash
npm run start:dev        # Development
npm run build            # Compile
npm run lint             # ESLint
npm run format           # Prettier
npm run test             # Unit tests
npm run test:e2e         # E2E tests
npx prisma migrate dev   # Create migration
npx prisma migrate deploy # Apply migrations
```

### Frontend

```bash
npm run dev              # Dev server
npm run build            # Build
npm run lint             # ESLint
npm run format           # Prettier
```

### Docker

```bash
docker-compose up -d              # Start
docker-compose logs -f [service]  # View logs
docker-compose exec [service] bash # Access
docker-compose down               # Stop
```

---

## License

MIT License - Free for personal, commercial, and educational use.

See [LICENSE](LICENSE) for details.

---

## Support

- 🐛 **Issues:** GitHub Issues
- 💬 **Discussions:** GitHub Discussions
- 📖 **Docs:** See /docs directory

---

**Last Updated:** January 2026  
**Version:** 0.0.1  
**Status:** In Active Development
