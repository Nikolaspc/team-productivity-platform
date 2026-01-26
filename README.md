# Team Productivity Platform 🚀

[![CI Pipeline](https://github.com/your-user/repo/actions/workflows/ci.yml/badge.svg)](...)
![NestJS](https://img.shields.io/badge/backend-NestJS%2011-red)
![Next.js](https://img.shields.io/badge/frontend-Next.js%2014-black)

**Enterprise-grade SaaS boilerplate** focusing on high availability, data integrity, and observability. Designed following German market standards for engineering excellence.

---

## 🏗 Key Engineering Implementations

### 1. Data Integrity & Compliance (GDPR Ready)

- **Automated Soft Deletes:** Implemented via Prisma Extensions to ensure data is never lost accidentally, fulfilling legal data recovery requirements.
- **Cascading Deactivation:** Custom transaction logic in `TeamsService` to handle multi-resource cleanup (Teams → Projects → Tasks) atomically.

### 2. Advanced Security Architecture

- **Double Token Strategy:** Stateless JWT for access tokens + Stateful `httpOnly` signed cookies for refresh tokens.
- **Cryptographic Standards:** Using `Argon2` (winner of PHC) for password hashing and secure session management.

* **BFF Proxy:** Next.js middleware acts as a security gatekeeper, intercepting requests to protect dashboard routes.

### 3. Resilience & Observability

- **Asynchronous Processing:** BullMQ handles heavy loads (e.g., Mail dispatching) outside the main request loop, preventing API bottlenecks.
- **Structured Logging:** Integrated `Pino` logger for high-performance JSON logs, ready for ELK stack or Datadog.
- **Health Monitoring:** Prometheus metrics and Terminus health checks built-in.

---

## 🛠 Tech Stack

| Layer        | Tech                                                  |
| :----------- | :---------------------------------------------------- |
| **Backend**  | NestJS, Prisma ORM, BullMQ, Passport.js, Swagger.     |
| **Frontend** | Next.js 14 (App Router), Zustand, TailwindCSS, Axios. |
| **Infra**    | PostgreSQL, Redis, Docker, GitHub Actions.            |

---

## 🚀 Installation (Docker Mode)

```bash
# 1. Clone & Setup envs
git clone <repo-url>
cp ./bff-nestjs/.env.example ./bff-nestjs/.env

# 2. Spin up the entire ecosystem
docker-compose up --build
🔑 Demo Accounts & Access
Admin: admin@demo.local / Password123

API Docs: http://localhost:3001/api/docs

Metrics: http://localhost:3001/metrics
```
