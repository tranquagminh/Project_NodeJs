# 🛒 E-Commerce Platform

A full-stack e-commerce platform built with modern technologies.

## Tech Stack

| Layer               | Technology                                                        |
| ------------------- | ----------------------------------------------------------------- |
| **Frontend (User)** | Next.js, TypeScript, TailwindCSS, Shadcn/UI, Zustand, React Query |
| **Admin Dashboard** | React, Vite, TypeScript, Ant Design, Recharts                     |
| **Backend API**     | Node.js, Express, TypeScript, JWT Authentication                  |
| **Database**        | PostgreSQL (Prisma ORM), Redis (Cache)                            |
| **Storage**         | AWS S3 / Cloudinary                                               |
| **Deployment**      | Docker, Vercel, VPS/AWS                                           |

## Project Structure

```
├── client/          # Frontend User (Next.js)
├── admin/           # Admin Dashboard (React + Vite)
├── server/          # Backend API (Express + TypeScript)
├── shared/          # Shared types & utilities
├── docker-compose.yml
└── package.json     # Root (npm workspaces)
```

## Getting Started

### Prerequisites

- Node.js >= 20
- Docker & Docker Compose
- npm >= 10

### 1. Clone & Install

```bash
git clone <repo-url>
cd ecommerce-project
npm install
```

### 2. Start Infrastructure (PostgreSQL + Redis)

```bash
docker compose up -d
```

### 3. Setup Database

```bash
cd server
cp .env.example .env
npx prisma migrate dev
npx prisma generate
```

### 4. Run Development Servers

```bash
# From root
npm run dev:server   # Backend  → http://localhost:5000
npm run dev:client   # Frontend → http://localhost:3000
npm run dev:admin    # Admin    → http://localhost:3001
```

## Scripts

| Command                | Description                       |
| ---------------------- | --------------------------------- |
| `npm run dev:server`   | Start backend in dev mode         |
| `npm run dev:client`   | Start frontend in dev mode        |
| `npm run dev:admin`    | Start admin dashboard in dev mode |
| `npm run build:server` | Build backend                     |
| `npm run build:client` | Build frontend                    |
| `npm run build:admin`  | Build admin dashboard             |
| `npm run lint`         | Lint all workspaces               |
| `npm run format`       | Format code with Prettier         |

## License

ISC
