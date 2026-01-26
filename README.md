# Team Productivity Platform – Monorepo

A SaaS-oriented application featuring a Backend-for-Frontend (BFF) architecture and modern frontend client. This documentation outlines the system structure, execution procedures, testing protocols, and validation standards following enterprise best practices.

---

## 📋 Repository Structure

```
.
├── bff-nestjs/           # Backend for Frontend (NestJS)
├── frontend-next/        # Frontend (Next.js)
├── .github/workflows/    # CI/CD & Quality Gates
└── README.md
```

- **Backend (BFF)**: Core system component exposing APIs consumed by the frontend
- **Frontend**: Next.js application communicating exclusively with the BFF
- **CI/CD**: Automated pipelines enforcing code quality and stability

---

## 🏗️ Backend (BFF – NestJS)

### Technology Stack

| Component         | Technology                  |
| ----------------- | --------------------------- |
| Runtime           | Node.js                     |
| Framework         | NestJS                      |
| Database          | PostgreSQL                  |
| ORM               | Prisma                      |
| Authentication    | JWT (Access/Refresh Tokens) |
| Background Jobs   | BullMQ                      |
| Monitoring        | Prometheus                  |
| Logging           | Pino (structured)           |
| API Documentation | Swagger/OpenAPI             |

### Core Responsibilities

- Authentication and authorization management
- User, team, and permission handling
- API exposure for frontend consumption
- Integration with external services (mail, storage, etc.)
- Observability through structured logging and metrics

---

## 🛠️ Local Development Requirements

- **Node.js** (version aligned with CI)
- **npm**
- **PostgreSQL**
- **Redis** (optional, depending on configuration)
- **Docker** (recommended)

---

## ⚙️ Environment Configuration

The backend requires environment variables defined in `bff-nestjs/.env.example`.

### Key Environment Variables

```env
DATABASE_URL          # PostgreSQL connection string
AT_SECRET            # Access token secret
RT_SECRET            # Refresh token secret
COOKIE_SECRET        # Session cookie secret
FRONTEND_URL         # Frontend application URL
PORT                 # Server port
```

### Setup Instructions

```bash
# Copy environment template
cp bff-nestjs/.env.example bff-nestjs/.env

# Update variables with your local values
```

⚠️ **Security Note**: Production secrets must be managed through a secure secret management solution (AWS Secrets Manager, HashiCorp Vault, etc.)

---

## 🚀 Running the Backend Locally

### Installation & Setup

```bash
cd bff-nestjs
npm ci
npx prisma generate
npx prisma migrate deploy
```

### Start Development Server

```bash
npm run start:dev
```

The backend will be accessible at the configured `PORT`.

### Database Seeding (Optional)

```bash
npm run prisma:seed
```

---

## 🗄️ Database & Migrations

The data model is defined in `prisma/schema.prisma`. All schema modifications are version-controlled using Prisma migrations.

### Applying Migrations

```bash
# Deploy pending migrations
npx prisma migrate deploy

# Create a new migration
npx prisma migrate dev --name <migration_name>
```

This approach ensures consistency across development, staging, and production environments.

---

## 🧪 Testing

### Test Coverage

- Unit tests
- Integration tests
- End-to-end (e2e) tests

### Running Tests Locally

```bash
# Unit and integration tests
npm run test

# End-to-end tests
npm run test:e2e

# Watch mode
npm run test:watch
```

**Note**: Tests are automatically executed as part of the CI quality gate on every Pull Request.

---

## 📊 Observability

### Logging

Structured logging is implemented using **Pino**, providing:

- Machine-readable log format
- Request/response tracing
- Error context and stack traces

### Metrics

**Prometheus** metrics are exposed at the `/metrics` endpoint, supporting:

- Performance monitoring
- Operational visibility
- Alerting and dashboards

These components enable effective debugging and monitoring in staging and production environments.

---

## 🔄 CI/CD & Quality Gates

GitHub Actions pipelines validate each Pull Request:

- ✓ Dependency installation (`npm ci`)
- ✓ Code linting
- ✓ Build verification
- ✓ Test execution (unit, integration, e2e)
- ✓ Security auditing (`npm audit`)

Pipelines are triggered automatically on Pull Requests to ensure consistent code quality standards.

---

## 🎨 Frontend (Next.js)

The frontend application is located in `frontend-next/`.

### Key Characteristics

- Communicates exclusively with the backend BFF
- Independent development lifecycle
- Separate dependency management

For frontend-specific documentation, refer to `frontend-next/README.md`.

---

## 📈 Development Workflow

### Branch Strategy

| Branch      | Purpose                         |
| ----------- | ------------------------------- |
| `main`      | Stable, production-ready code   |
| `develop`   | Integration branch for features |
| `feature/*` | Feature development branches    |

### Pull Request Checklist

Before submitting a Pull Request, ensure:

- ✓ Successful build
- ✓ Linting and tests pass
- ✓ No secrets committed
- ✓ Data model changes documented
- ✓ Meaningful commit messages

---

## 📝 Additional Notes

This repository implements a realistic, production-oriented SaaS architecture with emphasis on:

- **Maintainability**: Clear structure and documentation
- **Automation**: Comprehensive CI/CD pipelines
- **Operational Readiness**: Observability and monitoring capabilities
- **Security**: Secure authentication and secret management

The backend is the primary area of technical contribution and is documented in detail within this README.

---

## 📞 Support

For questions or issues, please refer to the project documentation or open an issue in the repository.
