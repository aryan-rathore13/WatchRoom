# WATCHROOM

A private watch-party web app. Create rooms, share invite links, and watch any screen together in sync with voice chat and text chat.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui primitives |
| Video/Audio | LiveKit (WebRTC SFU) via `@livekit/components-react` |
| Backend | Fastify v5, TypeScript |
| Database | PostgreSQL 16 via Prisma ORM |
| Cache | Redis 7 via ioredis |
| SFU | LiveKit self-hosted (Docker) |
| Monorepo | pnpm workspaces + Turborepo |

## Repository Structure

```
├── apps/
│   ├── web/            # Next.js 15 frontend
│   └── api/            # Fastify backend
├── packages/
│   └── types/          # Shared TypeScript types
├── infra/              # Docker Compose, LiveKit config, Caddyfile
├── .github/workflows/  # CI pipeline
├── turbo.json
└── pnpm-workspace.yaml
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Docker & Docker Compose** (for local infra)

## Local Development

### 1. Clone and install

```bash
git clone <your-repo-url>
cd watchroom
pnpm install
```

### 2. Start infrastructure

This starts PostgreSQL, Redis, and LiveKit SFU locally:

```bash
cd infra
docker compose up -d
```

Verify services are running:

```bash
docker compose ps
# postgres on :5432, redis on :6379, livekit on :7880
```

### 3. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
```

Default `.env` values work with the local Docker setup — no changes needed for dev.

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Push database schema

```bash
cd apps/api
pnpm db:push
```

### 5. Start dev servers

From the project root:

```bash
pnpm dev
```

This runs both apps in parallel via Turborepo:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **LiveKit SFU**: ws://localhost:7880

### 6. Smoke test

1. Open http://localhost:3000
2. Click **Create Master Room** (calls `POST /rooms`)
3. Copy the invite link, open in a second browser window
4. Enter a name in the lobby, join
5. Host shares screen — guest should see video + audio

## Production Deployment

### Deployment Architecture

| Component | Platform | Why |
|---|---|---|
| Frontend (`apps/web`) | **Vercel** | Zero-config Next.js hosting, edge CDN, preview deploys |
| Backend (`apps/api`) | **VPS** (Hetzner/Railway/Render) | Persistent connections to Postgres, Redis, LiveKit |
| LiveKit SFU | **VPS** (same or dedicated) | Needs UDP ports, TURN, stable IP |
| PostgreSQL | **Managed** (Neon/Supabase/RDS) or VPS | Production reliability |
| Redis | **Managed** (Upstash/ElastiCache) or VPS | Low-latency invite lookups |

> **Why not Vercel for the API?** Vercel serverless functions are stateless and cold-start on each request. The Fastify API needs persistent connections to PostgreSQL, Redis, and LiveKit's server SDK. A long-running server process on a VPS or container platform (Railway, Render, Fly.io) is the right fit.

### Frontend on Vercel

1. **Connect your GitHub repo** to Vercel

2. **Configure build settings** in Vercel dashboard:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm install && pnpm turbo build --filter=@watchroom/web`
   - **Output Directory**: `.next`

3. **Set environment variables** in Vercel:

   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

4. Every push to `main` triggers a production deploy. PRs get preview deploys automatically.

### Backend on VPS

1. **Provision a VPS** (Hetzner CX22 recommended — ~€4.51/mo, 20TB bandwidth)

2. **Install dependencies** on the server:

   ```bash
   curl -fsSL https://get.docker.com | sh
   npm install -g pnpm
   ```

3. **Clone and configure**:

   ```bash
   git clone <your-repo-url>
   cd watchroom

   # Create production env
   cat > apps/api/.env << 'EOF'
   DATABASE_URL="postgresql://user:pass@db-host:5432/watchroom"
   REDIS_URL="redis://redis-host:6379"
   LIVEKIT_API_KEY="your-api-key"
   LIVEKIT_API_SECRET="your-api-secret"
   LIVEKIT_URL="wss://livekit.yourdomain.com"
   PORT=3001
   CORS_ORIGIN="https://yourdomain.com"
   EOF
   ```

4. **Start infrastructure + API**:

   ```bash
   # Start LiveKit, Postgres, Redis
   cd infra
   docker compose up -d

   # Build and start API
   cd ../apps/api
   pnpm install
   pnpm build
   pnpm start
   ```

   For production, use a process manager:

   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name watchroom-api
   pm2 save
   pm2 startup
   ```

5. **Configure Caddy** for HTTPS (edit `infra/Caddyfile`):

   ```
   api.yourdomain.com {
     reverse_proxy localhost:3001
   }

   livekit.yourdomain.com {
     reverse_proxy localhost:7880
   }
   ```

### Required Ports (VPS firewall)

| Port | Protocol | Service |
|---|---|---|
| 80, 443 | TCP | Caddy (HTTP/HTTPS) |
| 443 | UDP | LiveKit TURN (TLS) |
| 3478 | UDP | LiveKit TURN |
| 7880 | TCP | LiveKit WebSocket |
| 7881 | TCP | LiveKit TCP fallback |
| 50000-60000 | UDP | LiveKit WebRTC media |

### Database Migrations (Production)

```bash
cd apps/api
pnpm db:migrate    # Creates migration files + applies them
```

## CI Pipeline

GitHub Actions runs on every push and PR:

- **Lint & Type Check**: `next build` (includes tsc), API type check
- **Build Verification**: Both apps build successfully
- **Prisma Validation**: Schema is valid

See `.github/workflows/ci.yml` for the full pipeline.

## Key Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start all dev servers (Turborepo) |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `cd apps/api && pnpm db:push` | Push schema to DB (dev) |
| `cd apps/api && pnpm db:migrate` | Run migrations (production) |
| `cd apps/api && pnpm db:generate` | Regenerate Prisma client |
| `cd infra && docker compose up -d` | Start local infrastructure |
| `cd infra && docker compose down` | Stop local infrastructure |

## Environment Variables Reference

### `apps/api/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection string |
| `LIVEKIT_API_KEY` | Yes | `devkey` | LiveKit API key |
| `LIVEKIT_API_SECRET` | Yes | `devsecret` | LiveKit API secret |
| `LIVEKIT_URL` | Yes | `ws://localhost:7880` | LiveKit server WebSocket URL |
| `PORT` | No | `3001` | API server port |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |

### `apps/web/.env.local`

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3001` | Backend API base URL |

## License

Private — All rights reserved.
