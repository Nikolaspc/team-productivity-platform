# Team Productivity Platform 🚀

[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![NestJS](https://img.shields.io/badge/backend-NestJS%2011-red?style=flat-square)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2016-black?style=flat-square)](https://nextjs.org/)
[![React](https://img.shields.io/badge/ui-React%2019-blue?style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript%205-blue?style=flat-square)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%2015-336791?style=flat-square)](https://www.postgresql.org/)
![Version](https://img.shields.io/badge/version-0.0.1--dev-yellow?style=flat-square)

**Full-stack SaaS prototype** demonstrating enterprise architectural patterns and best practices.

Built as a **learning project** to understand how professional applications are designed and engineered.

---

## 📋 Table of Contents

- [Learning Objectives](#learning-objectives)
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Core Implementation](#core-implementation)
- [Testing Strategy](#testing-strategy)
- [What I Learned](#what-i-learned)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Learning Objectives

This project was built to master the following areas of professional software engineering:

### Security & Authentication

- Password hashing with industry-standard algorithms (Argon2)
- JWT-based authentication patterns
- Token refresh strategies (access + refresh tokens)
- Role-Based Access Control (RBAC)
- HTTP-only cookies for secure token storage

### Scalable Architecture

- Backend-for-Frontend (BFF) pattern
- Modular service architecture
- Database design with migrations
- API design principles (RESTful)
- Real-time communication patterns (WebSocket)

### Data Integrity & Compliance

- Soft delete patterns for data recovery
- Cascading transactions for data consistency
- Audit trails and change tracking
- GDPR-friendly data handling
- Database constraints and validation

### Production Readiness Concepts

- Structured logging (JSON-based)
- Metrics and monitoring
- Health checks
- Background job processing with retry logic
- Rate limiting and throttling
- Error handling strategies

### Testing & Quality

- Unit testing approaches
- Integration testing with real databases
- E2E testing scenarios
- Code quality tooling (ESLint, Prettier)
- Continuous integration basics

### Real-Time Collaboration

- WebSocket implementation
- Broadcasting patterns
- Client state synchronization
- Presence tracking concepts

---

## Project Overview

Team Productivity Platform is a **full-stack application** that demonstrates how to build a SaaS system with modern engineering practices. It provides functionality for teams to collaborate on projects and tasks with real-time updates.

### Status

- **Version:** 0.0.1 (Development)
- **Production Ready:** No (Learning project)
- **Status:** In Active Development
- **Objective:** Educational demonstration of architectural patterns

### What This Project Shows

✅ How to structure a full-stack application  
✅ How security is implemented in practice  
✅ How to design scalable APIs  
✅ How testing fits into development  
✅ How to handle real-time features  
✅ Understanding production patterns (without running in production)

---

## Architecture

### System Design

```
┌──────────────────────────┐
│   Browser / Client       │
└────────────┬─────────────┘
             │ HTTP/HTTPS + WebSocket
    ┌────────▼──────────┐
    │  Next.js 16       │
    │  Frontend         │
    │  (port 3000)      │
    │                   │
    │ • Zustand store   │
    │ • React hooks     │
    │ • TailwindCSS     │
    │ • Radix UI        │
    └────────┬──────────┘
             │
    ┌────────▼──────────────────┐
    │  NestJS BFF (port 3001)   │
    │                           │
    │ Core Modules:             │
    │ • Auth (JWT + Argon2)     │
    │ • Teams                   │
    │ • Projects                │
    │ • Tasks                   │
    │ • WebSocket Gateway       │
    │ • Health Checks           │
    │ • Metrics                 │
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
                │ (Async)      │
                └──────────────┘
```

### Authentication Flow Explained

```
1. User Login
   POST /auth/signin { email, password }

2. Password Validation
   Compare input with Argon2 hash (why Argon2? Won Password Hashing Competition)

3. Token Generation
   • Access Token: JWT, 15 minutes (for immediate requests)
   • Refresh Token: JWT in httpOnly cookie, 7 days (for prolonged sessions)

4. Frontend Storage
   • Zustand state: user info + authentication flag
   • Cookies: refresh_token (automatic, JS cannot access)

5. Subsequent Requests
   Authorization: Bearer <accessToken>
   Cookies: refresh_token (automatic)

6. Guard Validation
   @AtGuard: Verify JWT signature and expiration
   @RolesGuard: Check user role (USER/MANAGER/ADMIN)

7. Token Refresh (When Expired)
   POST /auth/refresh → New accessToken from refreshToken cookie

Why this approach?
✓ Access tokens are short-lived (harder to misuse if stolen)
✓ Refresh tokens in httpOnly cookies (cannot be accessed by JavaScript/XSS)
✓ Automatic refresh transparent to user
✓ Logout clears both tokens
```

---

## Tech Stack

### Why These Choices?

#### Backend: NestJS 11.0.0

**Why NestJS?**

- Strong TypeScript support (end-to-end type safety)
- Built-in modularity (clean architecture)
- Dependency injection (professional patterns)
- Guards, interceptors, decorators (production-ready features)
- Great for learning architectural patterns

**Key Dependencies:**

```json
{
  "core": {
    "nestjs": "11.0.0",
    "typescript": "5.7.0",
    "node": "18.x or 20.x LTS"
  },
  "database": {
    "prisma": "5.22.0",
    "postgresql": "15-alpine"
  },
  "authentication": {
    "@nestjs/jwt": "11.0.0",
    "passport-jwt": "4.0.1",
    "argon2": "0.41.0"
  },
  "realtime": {
    "socket.io": "4.8.0",
    "@nestjs/websockets": "11.0.0"
  },
  "async_jobs": {
    "bullmq": "5.67.1",
    "@nestjs/bullmq": "11.0.4"
  },
  "observability": {
    "nestjs-pino": "4.5.0",
    "@willsoto/nestjs-prometheus": "6.0.0",
    "@nestjs/terminus": "11.0.0"
  },
  "validation": {
    "class-validator": "0.14.1",
    "class-transformer": "0.5.1",
    "joi": "17.13.0"
  }
}
```

#### Frontend: Next.js 16.1.1

**Why Next.js?**

- Server-side rendering capabilities
- Built-in routing (App Router)
- API routes (if needed)
- Great TypeScript support
- Perfect for learning modern React patterns

**Key Dependencies:**

```json
{
  "framework": {
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "typescript": "5.x"
  },
  "state_management": {
    "zustand": "5.0.10"
  },
  "http_client": {
    "axios": "1.13.2"
  },
  "forms": {
    "react-hook-form": "7.71.1",
    "@hookform/resolvers": "5.2.2",
    "zod": "4.3.6"
  },
  "ui_components": {
    "@radix-ui/*": "latest",
    "tailwindcss": "4.x",
    "lucide-react": "0.563.0",
    "sonner": "2.0.7"
  }
}
```

#### Why Zustand for State Management?

Zustand is minimal but powerful:

- ✅ Simple API (no boilerplate)
- ✅ TypeScript-friendly
- ✅ Middleware support (persistence)
- ✅ Great for learning state management concepts
- ✅ Production-ready

#### Infrastructure

| Component          | Version   | Purpose           | Learning Value                            |
| ------------------ | --------- | ----------------- | ----------------------------------------- |
| **PostgreSQL**     | 15-alpine | Relational DB     | Understand SQL, schema design, migrations |
| **Redis**          | 7-alpine  | Cache + Job Queue | Learn async patterns, caching strategies  |
| **Docker Compose** | 3.8       | Local environment | Understand containerization basics        |

---

## Key Features

### 1. Security Implementation

What I built to understand security:

#### Password Hashing (Argon2)

```typescript
// Why Argon2?
// - Winner of Password Hashing Competition (2015)
// - Memory-hard algorithm (resistant to GPU attacks)
// - Configurable CPU/memory costs
// - Industry standard for modern applications

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 65MB
  timeCost: 3, // 3 iterations
  parallelism: 1,
});
```

#### JWT Authentication Pattern

```
Why split tokens?
- Access Token (15m): Used for every request, short-lived
- Refresh Token (7d): Longer-lived, only used when access expires
- If access token stolen: Limited window of misuse
- If refresh token stolen: Still httpOnly (JS cannot access)
```

#### Role-Based Access Control

```typescript
// Demonstrates permission layers
enum Role {
  USER = 'USER',           // Basic access
  MANAGER = 'MANAGER',     // Can manage users
  ADMIN = 'ADMIN'          // Full system access
}

@Roles(Role.ADMIN)
@Get('system/admin-panel')
getAdminPanel() {
  // Only admins can access
}
```

### 2. Data Integrity Patterns

What I learned about keeping data safe:

#### Soft Deletes (GDPR Compliance)

```typescript
// Instead of: DELETE FROM users WHERE id = 1
// Use: UPDATE users SET deletedAt = now() WHERE id = 1

// Benefits:
// ✓ Data recovery (if needed)
// ✓ Audit trails (know when deleted)
// ✓ GDPR compliance (data still exists, just inactive)
// ✓ Referential integrity (no broken foreign keys)

const tasks = await prisma.task.findMany({
  where: { deletedAt: null }, // Only show active tasks
});
```

#### Cascading Transactions

```typescript
// When deleting a team:
// Team → Projects → Tasks → Attachments
// All deleted atomically (all succeed or all rollback)

// Why matter?
// ✓ No orphaned records
// ✓ Consistency guaranteed
// ✓ Atomic operations (no partial states)
```

### 3. Scalability Concepts

What I understood about building scalable systems:

#### Async Job Processing (BullMQ)

```typescript
// Email sending example:
// Instead of: await sendEmail(...) // Slow, blocks request
// Use: queue.add('send-email', data) // Fast, async

// Benefits:
// ✓ Request completes immediately
// ✓ Email sends in background
// ✓ Automatic retries (3 attempts with exponential backoff)
// ✓ Resilient (survives crashes)
```

#### Connection Pooling

```typescript
// Database connections are expensive
// Pool them for reuse:
DATABASE_POOL_SIZE = 10; // Reuse 10 connections

// Why matter?
// ✓ Each connection has overhead
// ✓ Pooling = better performance
// ✓ Prevents "too many connections" errors
```

#### Rate Limiting

```typescript
// Prevent abuse: 20 requests per 60 seconds per IP
THROTTLE_LIMIT = 20;
THROTTLE_TTL = 60000;

// Why matter?
// ✓ Protects against DoS attacks
// ✓ Fair resource usage
// ✓ Prevents spam
```

### 4. Real-Time Features

What I learned about WebSocket patterns:

#### Socket.IO Gateway

```typescript
// When task is created:
@SubscribeMessage('taskCreated')
handleTaskCreated(data) {
  // Notify all connected users
  this.server.emit('taskCreated', data);
}

// Why matter?
// ✓ Users see updates instantly
// ✓ Better UX than polling
// ✓ Scalable (WebSocket is efficient)
// ✓ Supports presence tracking
```

### 5. Observability & Monitoring

What I implemented to understand production readiness:

#### Structured Logging (Pino)

```json
{
  "level": "info",
  "timestamp": "2024-01-15T10:30:00Z",
  "module": "AuthService",
  "message": "User login successful",
  "userId": "123",
  "email": "user@example.com",
  "duration_ms": 45
}
```

Why JSON logs?
✓ Machine-parseable (not just human-readable text)
✓ Can aggregate and search in ELK/Datadog
✓ Structured context (userId, duration, etc.)

#### Metrics (Prometheus)

```
http_requests_total{method="POST", status="201"} 42
http_request_duration_seconds_bucket{le="0.1", method="GET"} 15
nodejs_heap_size_bytes 256000000
```

#### Health Checks

```http
GET /health
Response: {
  "status": "ok",
  "database": { "status": "up" },
  "redis": { "status": "up" }
}
```

---

## Requirements

### Minimum System Setup

- **Node.js:** 18.x LTS or 20.x LTS
- **npm:** 9.x or higher
- **PostgreSQL:** 15+ (Docker or local)
- **Redis:** 7+ (Docker or local, recommended)
- **Git:** For version control

### Recommended for Development

- **Docker & Docker Compose:** Simplest full setup
- **VS Code:** With ESLint + Prettier extensions
- **Postman/Insomnia:** API testing tool

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/Nikolaspc/team-productivity-platform.git
cd team-productivity-platform

# 2. Create environment file
cp bff-nestjs/.env.example bff-nestjs/.env
# Defaults work for local development

# 3. Start all services
docker-compose up --build

# 4. In another terminal, run database migrations
docker-compose exec tpp-bff npx prisma migrate deploy

# ✅ Services ready:
# Frontend:         http://localhost:3000
# Backend:          http://localhost:3001
# API Documentation: http://localhost:3001/api/docs
# Maildev (test):   http://localhost:1080
# Metrics:          http://localhost:3001/metrics
```

**Verify everything is running:**

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f tpp-bff
docker-compose logs -f tpp-redis

# Stop services
docker-compose down
```

### Option 2: Local Development (Without Docker)

```bash
# 1. Clone repository
git clone https://github.com/Nikolaspc/team-productivity-platform.git
cd team-productivity-platform

# 2. Backend setup
cd bff-nestjs
cp .env.example .env
npm ci
npx prisma migrate deploy

# 3. Start backend (Terminal 1)
npm run start:dev

# 4. Frontend setup (Terminal 2)
cd frontend-next
npm ci
npm run dev

# ✅ Access: http://localhost:3000
```

---

## Project Structure

### Backend Organization

```
bff-nestjs/
├── src/
│   ├── auth/                    # JWT + Argon2 authentication
│   │   ├── auth.controller.ts   # Endpoints
│   │   ├── auth.service.ts      # Business logic
│   │   ├── guards/              # JWT validation
│   │   └── dto/                 # Request/response schemas
│   │
│   ├── modules/
│   │   ├── teams/               # Team management
│   │   ├── projects/            # Project management
│   │   ├── tasks/               # Task management + WebSocket
│   │   ├── invitations/         # Email invitations
│   │   ├── notifications/       # WebSocket gateway
│   │   ├── storage/             # File uploads (S3)
│   │   ├── mail/                # Email service + BullMQ
│   │   ├── dashboard/           # Analytics/reporting
│   │   └── health/              # Health checks
│   │
│   ├── common/
│   │   ├── guards/              # RBAC validation
│   │   ├── decorators/          # Custom decorators
│   │   ├── filters/             # Error handling
│   │   └── interceptors/        # Request/response manipulation
│   │
│   ├── prisma/                  # Database connection
│   ├── config/                  # Configuration
│   └── main.ts                  # Application bootstrap
│
├── prisma/
│   ├── schema.prisma            # Database schema (learning point)
│   ├── migrations/              # Schema change history
│   └── seed.ts                  # Test data
│
├── test/                        # E2E tests
├── package.json
└── Dockerfile
```

### Frontend Organization

```
frontend-next/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── auth/                # Login/signup pages
│   │   ├── dashboard/           # Protected area
│   │   ├── layout.tsx           # Root layout
│   │   └── error.tsx            # Error boundary
│   │
│   ├── components/              # Reusable React components
│   │   ├── auth/                # Auth forms
│   │   ├── teams/               # Team UI
│   │   ├── projects/            # Project UI
│   │   ├── tasks/               # Task UI
│   │   └── common/              # Shared components
│   │
│   ├── store/                   # Zustand stores (learning point)
│   │   ├── authStore.ts         # Auth state + persistence
│   │   ├── teamsStore.ts
│   │   ├── projectsStore.ts
│   │   └── tasksStore.ts
│   │
│   ├── services/                # API communication
│   │   ├── api.ts               # Axios + interceptors
│   │   ├── auth.service.ts
│   │   ├── teams.service.ts
│   │   └── socket.service.ts    # WebSocket client
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Authentication
│   │   ├── useTeams.ts          # Data fetching
│   │   └── useNotifications.ts  # WebSocket listener
│   │
│   ├── types/                   # TypeScript interfaces
│   ├── utils/                   # Helper functions
│   ├── middleware.ts            # Route protection
│   └── globals.css              # TailwindCSS
│
├── public/                      # Static files
├── package.json
└── Dockerfile
```

---

## Development Setup

### Environment Configuration

#### Backend (.env)

```bash
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL="http://localhost:3000"
LOG_LEVEL="debug"

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/productivity_db?schema=public"
DATABASE_POOL_SIZE=10

# JWT Secrets (generate with: openssl rand -base64 32)
AT_SECRET="your-32-character-secret-here"
RT_SECRET="your-32-character-secret-here"
COOKIE_SECRET="your-32-character-secret-here"
AT_EXPIRES_IN="15m"
RT_EXPIRES_IN="7d"

# Redis
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Email (use Ethereal for testing)
MAIL_HOST="smtp.ethereal.email"
MAIL_PORT=587
MAIL_USER="your-ethereal-email@ethereal.email"
MAIL_PASS="your-ethereal-password"
MAIL_FROM='"Team Productivity" <no-reply@app.local>'

# Storage (Supabase S3)
STORAGE_ENDPOINT="https://your-project.storage.supabase.co/storage/v1/s3"
STORAGE_REGION="eu-central-1"
STORAGE_ACCESS_KEY="your-key"
STORAGE_SECRET_KEY="your-secret"
STORAGE_BUCKET="attachments"
STORAGE_FORCE_PATH_STYLE=true

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=20
```

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Generate Secure Secrets

```bash
# Generate three 32+ character secrets
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 32

# Add results to AT_SECRET, RT_SECRET, COOKIE_SECRET in .env
```

---

## Core Implementation

### Authentication Flow Implementation

```typescript
// auth.service.ts - How passwords are hashed and verified
async hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
}

async verifyPassword(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
```

### Frontend State Management (Zustand)

```typescript
// store/authStore.ts - How user state persists
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        Cookies.set('access_token', token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          httpOnly: true,
        });
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        Cookies.remove('access_token');
        set({ user: null, isAuthenticated: false });
        window.location.href = '/auth/login';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
```

### API Integration (Axios)

```typescript
// services/api.ts - How frontend communicates with backend
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token flow
      // ... (implementation)
    }
    return Promise.reject(error);
  },
);
```

### Database Schema (Prisma)

```prisma
// prisma/schema.prisma - Database design decisions

model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  password  String  // Stored as Argon2 hash
  name      String?
  role      Role    @default(USER)

  teams     TeamMember[]
  tasks     Task[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? // Soft delete
}

model Team {
  id        Int     @id @default(autoincrement())
  name      String

  members   TeamMember[]
  projects  Project[]

  createdAt DateTime @default(now())
  deletedAt DateTime? // Soft delete
}

model Task {
  id          Int         @id @default(autoincrement())
  title       String
  status      TaskStatus  @default(TODO)
  projectId   Int
  assigneeId  Int?

  project     Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee    User?       @relation(fields: [assigneeId], references: [id])

  createdAt   DateTime    @default(now())
  deletedAt   DateTime?   // Soft delete
}

// Enums demonstrate understanding of domain modeling
enum Role {
  USER
  MANAGER
  ADMIN
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}
```

---

## Testing Strategy

### How I Approach Testing

```bash
# Unit tests - Test individual functions in isolation
npm run test

# Watch mode - Useful during development
npm run test:watch

# Coverage report - See what's tested
npm run test:cov

# Integration tests - Test with real database
npm run test:int

# E2E tests - Test complete user flows
npm run test:e2e
```

### Example Unit Test

```typescript
// auth.service.spec.ts - Testing password hashing

describe('AuthService - Password Hashing', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Setup test environment
  });

  describe('hashPassword', () => {
    it('should hash password with Argon2', async () => {
      const password = 'MyPassword123!';
      const hash = await service.hashPassword(password);

      // Verify it's actually hashed (not plaintext)
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should be different hash for same password', async () => {
      const password = 'MyPassword123!';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      // Different salt = different hash (even for same password)
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'MyPassword123!';
      const hash = await service.hashPassword(password);
      const isValid = await service.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'MyPassword123!';
      const hash = await service.hashPassword(password);
      const isValid = await service.verifyPassword('WrongPassword', hash);

      expect(isValid).toBe(false);
    });
  });
});
```

### What This Tests Show

✅ **Unit tests demonstrate:**

- Understanding of what to test
- How to write testable code
- Knowledge of edge cases
- Professional testing practices

✅ **Integration tests demonstrate:**

- Understanding of database interactions
- Transaction handling
- Real-world data scenarios

✅ **E2E tests demonstrate:**

- Complete user flows
- System integration
- Realistic testing scenarios

---

## What I Learned

### Technical Insights

1. **Security is Complex**

   - Not just encryption, but design patterns
   - Token strategy matters (access vs refresh)
   - Soft deletes for compliance
   - Rate limiting for abuse prevention

2. **Architecture Decisions Have Trade-offs**

   - BFF pattern (complexity vs flexibility)
   - Soft deletes (storage vs recovery)
   - Async jobs (performance vs eventual consistency)
   - WebSocket vs polling (overhead vs UX)

3. **Real-time Systems Are Harder Than Expected**

   - State synchronization challenges
   - Connection management
   - Message ordering
   - Scalability considerations

4. **Testing Must Be Part of Design**

   - Hard to test bad architecture
   - Better to test from start than add later
   - Different test types have different values
   - Coverage metrics don't tell full story

5. **Observability Matters**
   - Logs need to be queryable
   - Metrics help understand system behavior
   - Health checks prevent cascading failures

### Professional Lessons

✅ **Clean code is a skill learned gradually**  
✅ **Documentation is as important as code**  
✅ **Security requires continuous thinking**  
✅ **Scalability considerations start at design**  
✅ **Testing is an investment, not overhead**  
✅ **Monitoring prevents fires, not puts them out**

### What I'd Do Differently

If I rebuilt this project:

1. **Start with detailed schema design** (I refined it during development)
2. **Write tests from the beginning** (easier than retrofitting)
3. **Document architectural decisions** (helps future me and teammates)
4. **More granular error handling** (learned this the hard way)
5. **Performance testing earlier** (not just after "done")

---

## Future Improvements

### Short Term (Learning)

- [ ] More comprehensive integration tests
- [ ] API versioning strategy
- [ ] Request validation at multiple layers
- [ ] Better error codes and messages
- [ ] More detailed API documentation

### Medium Term (Features)

- [ ] Task comments and discussions
- [ ] Dashboard with analytics
- [ ] Advanced filtering and search
- [ ] Task templates and bulk operations
- [ ] Custom fields per team

### Long Term (Scaling)

- [ ] Event sourcing for audit trail
- [ ] GraphQL API option
- [ ] Mobile application
- [ ] Offline-first capabilities
- [ ] Third-party integrations (Slack, GitHub)

---

## Key Commands

### Development

```bash
# Backend
cd bff-nestjs
npm run start:dev        # Watch mode
npm run build            # Compile TypeScript
npm run lint             # Check code quality
npm run format           # Auto-format code
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev --name <name>  # Create migration
npx prisma migrate deploy              # Apply migrations
npx prisma db seed                     # Populate test data
npx prisma studio                      # GUI database browser

# Frontend
cd frontend-next
npm run dev              # Development server
npm run build            # Production build
npm run lint             # Check code
npm run format           # Format code
```

### Docker

```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f tpp-bff
docker-compose logs -f tpp-redis

# Access services
docker-compose exec tpp-db psql -U postgres -d productivity_db
docker-compose exec tpp-redis redis-cli

# Stop
docker-compose down
```

---

## How to Use This For Learning

### If You're Learning Backend

1. Study `bff-nestjs/src/auth/` for security patterns
2. Look at `bff-nestjs/prisma/schema.prisma` for database design
3. Review guards and interceptors for middleware patterns
4. Check test files for testing approaches

### If You're Learning Frontend

1. Look at `frontend-next/src/store/authStore.ts` for state management
2. Review `frontend-next/src/services/api.ts` for API integration
3. Check `frontend-next/src/middleware.ts` for route protection
4. Study form components for validation patterns

### If You're Learning Full-Stack

1. Understand the separation of concerns (BFF pattern)
2. See how frontend and backend communicate
3. Learn database design thinking
4. Understand security at each layer

---

## License

MIT License - Free for personal, commercial, and educational use.

See [LICENSE](LICENSE) for complete terms.

---

## Questions For Interviews

### Prepare For These Common Questions

**"Why did you build this?"**

> To understand how professional SaaS applications are designed and engineered. I wanted hands-on experience with security patterns, real-time features, testing, and production-readiness concepts.

**"What was the hardest part?"**

> Understanding token refresh strategies and state synchronization in real-time features. I learned that simple concepts have subtle complexities.

**"What would you do differently?"**

> Start with detailed schema design and write tests from day one. Also, I'd document architectural decisions as I make them.

**"What did you learn from this?"**

> That professional software development is about trade-offs, not perfect solutions. Every choice has consequences you need to understand.

**"Why these technologies?"**

> NestJS for strong typing and architecture patterns, Next.js for modern React practices, Prisma for type-safe ORM. All are industry-standard for learning professional patterns.

**"Is this production-ready?"**

> No, it's v0.0.1. It demonstrates production patterns and concepts, but would need security audits, performance testing, and operational setup before handling real users.

---

## About Me (For Interviews)

This project demonstrates:

- ✅ Ability to learn independently
- ✅ Understanding of professional patterns
- ✅ Critical thinking about trade-offs
- ✅ Awareness of what I don't know
- ✅ Initiative to learn beyond requirements
- ✅ Capacity to handle complexity

---

## Repository Structure

This repository is organized as follows:

```
team-productivity-platform/
├── README.md                      # This file - Project overview
├── LICENSE                        # MIT License
├── .gitignore                     # Git ignore rules
│
├── bff-nestjs/                    # Backend (NestJS)
│   ├── src/
│   ├── prisma/
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend-next/                 # Frontend (Next.js)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── Dockerfile
│   └── .env.example
│
├── prisma/                        # Database schema
│   ├── schema.prisma
│   └── migrations/
│
├── docker-compose.yml             # Local development stack
├── docker-compose.prod.yml        # Production stack (optional)
│
├── docs/                          # Additional documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
└── .github/                       # GitHub specific
    └── workflows/                 # CI/CD pipelines
```

## Support & Community

- **Issues:** [GitHub Issues](https://github.com/Nikolaspc/team-productivity-platform/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Nikolaspc/team-productivity-platform/discussions)
- **Security:** See [SECURITY.md](SECURITY.md) for reporting security issues

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**Last Updated:** January 2026  
**Version:** 0.0.1 (Development)  
**Status:** In Active Development for Learning  
**License:** MIT
