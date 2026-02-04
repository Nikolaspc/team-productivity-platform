# Team Productivity Platform 🚀

Full-stack SaaS prototype with enterprise-grade CI/CD, code quality enforcement, and comprehensive testing.

---

## 🎯 What's New (February 2026)

✅ **Enterprise CI/CD Pipeline** - GitHub Actions automation
✅ **Code Quality Standards** - ESLint v9 with 50+ rules
✅ **Enhanced Testing** - 103+ tests, 75%+ coverage
✅ **Production Configuration** - Health checks, monitoring, logging

---

## 🚀 Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/Nikolaspc/team-productivity-platform.git
cd team-productivity-platform
cp bff-nestjs/.env.example bff-nestjs/.env
docker-compose up --build
docker-compose exec tpp-bff npx prisma migrate deploy
```

Access:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

### Local Development

```bash
# Backend
cd bff-nestjs
npm ci && npx prisma migrate deploy
npm run start:dev

# Frontend (new terminal)
cd frontend-next
npm ci && npm run dev
```

---

## 📊 CI/CD Pipeline

GitHub Actions automatically validates:

**Code Quality**

- ESLint: 50+ rules enforced
- Prettier: Code formatting
- TypeScript: Strict mode

**Testing**

- 103+ unit tests
- Integration tests
- E2E tests
- 75%+ coverage threshold

**Build**

- Production artifact
- No TypeScript errors
- Dependency resolution

**Artifacts**

- Coverage reports (30 days)
- Build dist (7 days)
- Test results (7 days)

View at: GitHub → Actions → Enterprise CI Pipeline

---

## 📋 Tech Stack

| Layer           | Technology     | Version |
| --------------- | -------------- | ------- |
| **Backend**     | NestJS         | 11.0.0  |
| **Frontend**    | Next.js        | 16.1.1  |
| **Database**    | PostgreSQL     | 15      |
| **Cache/Queue** | Redis          | 7       |
| **Auth**        | JWT + Argon2   | -       |
| **Real-time**   | Socket.IO      | 4.8.0   |
| **Linting**     | ESLint         | 9.0.0   |
| **Testing**     | Jest           | 29.7.0  |
| **CI/CD**       | GitHub Actions | Latest  |

---

## 🔐 Security Features

- Argon2 password hashing
- JWT access + refresh tokens
- HTTP-only secure cookies
- Role-Based Access Control (RBAC)
- Rate limiting (20 req/min)
- Soft deletes (GDPR compliance)
- Cascading transactions

---

## 🧪 Testing

```bash
npm run test          # Unit tests
npm run test:cov      # Coverage report
npm run test:int      # Integration tests
npm run test:e2e      # E2E tests
```

**Coverage Requirements:**

- Statements: 75%+ ✅
- Branches: 65%+ ✅
- Functions: 70%+ ✅
- Lines: 75%+ ✅

**Current:** 79.26% (103/108 tests passing)

---

## 📝 Code Quality

```bash
npm run lint          # Check
npm run lint -- --fix # Auto-fix
npm run format        # Prettier format
```

**Enforced:**

- Type safety (@typescript-eslint)
- Naming conventions
- No unused variables
- Security best practices

---

## 🔧 Environment Setup

### Backend (.env)

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/productivity_db?schema=public
AT_SECRET=your-32-character-secret
RT_SECRET=your-32-character-secret
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
THROTTLE_LIMIT=20
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 📊 Project Structure

```
team-productivity-platform/
├── bff-nestjs/              # Backend
│   ├── src/
│   ├── prisma/
│   ├── eslint.config.js     # Code quality
│   ├── jest.config.js       # Testing
│   └── package.json
│
├── frontend-next/           # Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docker-compose.yml
└── .github/
    └── workflows/
        └── ci.yml           # CI/CD Pipeline
```

---

## 📚 Key Features

### Authentication

- JWT-based (access + refresh tokens)
- Argon2 password hashing
- Role-based access control

### Real-Time

- WebSocket gateway (Socket.IO)
- Instant task updates
- Presence tracking

### Data Management

- Soft deletes
- Cascading transactions
- Database migrations

### Observability

- Structured logging (Pino)
- Prometheus metrics
- Health checks

### DevOps

- GitHub Actions CI/CD
- Automated testing
- Coverage enforcement
- Artifact persistence

---

## 🎓 What I Learned

✅ Professional backend architecture (NestJS)
✅ Modern frontend patterns (Next.js, React)
✅ Secure authentication (JWT, Argon2)
✅ Real-time features (WebSocket)
✅ Database design (Prisma, PostgreSQL)
✅ Testing strategies (Unit, Integration, E2E)
✅ **CI/CD automation** ← NEW
✅ **Code quality enforcement** ← NEW
✅ **DevOps practices** ← NEW

---

## 🔗 Useful Commands

### Development

```bash
npm run start:dev     # Backend watch mode
npm run build         # Compile
npm run lint          # Check quality
npm run test          # Run tests
npm run test:cov      # Coverage
```

### Database

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npx prisma studio
```

### Docker

```bash
docker-compose up --build
docker-compose logs -f
docker-compose down
```

---

## 📋 GitHub Secrets (Required for CI/CD)

Configure in: Settings → Secrets and variables → Actions

```
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
MAIL_HOST
MAIL_PORT
MAIL_USER
MAIL_PASS
MAIL_FROM
```

---

## 📄 License

MIT License - Free for personal, commercial, and educational use.

---

**Last Updated:** February 2026  
**Version:** 0.0.1  
**Status:** In Active Development with Professional CI/CD  
**License:** MIT

---

## 🔗 Quick Links

- **Issues:** [GitHub Issues](https://github.com/Nikolaspc/team-productivity-platform/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Nikolaspc/team-productivity-platform/discussions)
- **CI/CD Pipeline:** [GitHub Actions](https://github.com/Nikolaspc/team-productivity-platform/actions)
