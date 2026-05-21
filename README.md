# 🩸 Blood Bank Management System (BBMS) v2.0

An enterprise-grade, multi-branch, real-time blood bank management platform built with the MERN stack and containerized with Docker.

---

## 🏗️ Architecture

```
                        ┌─────────────────────────────┐
                        │     Browser / Client         │
                        └─────────────┬───────────────┘
                                      │ HTTP :80
                        ┌─────────────▼───────────────┐
                        │     nginx (Reverse Proxy)    │
                        │     Container: bbms-nginx    │
                        └──────┬──────────────┬───────┘
                               │              │
              /api/* /socket.io│              │ /*
                        ┌──────▼──────┐ ┌────▼────────┐
                        │   server    │ │   client    │
                        │ Express API │ │ React SPA   │
                        │ Socket.IO   │ │ (Nginx)     │
                        │ bbms-server │ │ bbms-client │
                        └──────┬──────┘ └─────────────┘
                               │
                        ┌──────▼──────┐
                        │    mongo    │
                        │  MongoDB 7  │
                        │ bbms-mongo  │
                        └─────────────┘
```

## 🐳 Docker Services

| Container | Image | Internal Port | Purpose |
|---|---|---|---|
| `bbms-nginx` | `nginx:1.27-alpine` | 80 → **host:80** | Reverse proxy + entry point |
| `bbms-server` | `node:22-alpine` (multi-stage) | 5000 (internal) | REST API + Socket.IO |
| `bbms-client` | `node:22-alpine` → `nginx:1.27` | 80 (internal) | Vite build, served by Nginx |
| `bbms-mongo` | `mongo:7.0` | 27017 (internal) | Primary MongoDB database |
| `bbms-mongo-express` | `mongo-express:1.0` | 8081 (dev only) | MongoDB admin UI |

## 🚀 Quick Start

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) v2 (included with Docker Desktop)
- `make` (optional but recommended)

### 2. Setup Environment
```bash
# Clone the project
git clone <repo-url>
cd BloodBank

# Copy the Docker env template and fill in your values
cp .env.docker .env
# OR use make:
make setup
```

Edit `.env` — at minimum set:
- `JWT_SECRET` — generate with: `openssl rand -base64 64`
- `MONGO_ROOT_PASSWORD`
- `SMTP_*` — for email notifications

### 3. Production Start
```bash
# Start all services (pulls/builds images, starts containers)
docker compose up -d

# With make:
make prod

# Build and start (force rebuild):
make prod-build
```

Access the application at **http://localhost**

### 4. Development Mode (Hot Reload)
```bash
# Hot-reload for both server (node --watch) and client (Vite HMR)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# With make:
make dev

# Also start mongo-express admin UI at http://localhost:8081:
make dev-tools
```

Access:
- App: **http://localhost:5173**
- Server: **http://localhost:5000**
- Mongo Express: **http://localhost:8081**

---

## 📁 Project Structure

```
BloodBank/
├── client/                  # React + Vite frontend
│   ├── Dockerfile           # Multi-stage: build → nginx serve
│   ├── nginx.conf           # SPA nginx config (inside client container)
│   ├── vite.config.js       # Vite config with code splitting
│   └── src/
├── server/                  # Node.js + Express backend
│   ├── Dockerfile           # Multi-stage: deps → production
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── nginx/                   # Reverse proxy service
│   ├── Dockerfile
│   └── nginx.conf           # Routes /api, /socket.io, / to services
├── mongo/
│   └── init/
│       └── 01-init.js       # Creates app user + indexes on first run
├── docker-compose.yml       # Production: all 4 services
├── docker-compose.dev.yml   # Dev override: hot-reload + mongo-express
├── .env.docker              # Environment template
├── Makefile                 # Developer convenience commands
└── README.md
```

---

## 🛠️ Make Commands Reference

```bash
make help          # Show all commands

# Production
make prod          # docker compose up -d
make prod-build    # Rebuild + start
make down          # Stop all services
make down-clean    # Stop + remove ALL volumes (data loss!)

# Development
make dev           # Start dev mode (hot-reload)
make dev-tools     # Start dev + mongo-express admin UI

# Logs
make logs          # Tail all logs
make logs-server   # Tail server logs only
make logs-nginx    # Tail nginx logs

# Shells
make shell-server  # Open sh in server container
make shell-mongo   # Open mongosh

# Database
make mongo-backup  # Dump MongoDB to ./backups/
make mongo-restore FILE=backups/xxx.gz

# Status
make ps            # Show container status
```

---

## 🌐 Network Isolation

Two isolated Docker bridge networks:

| Network | Members | Purpose |
|---|---|---|
| `bbms-backend` | `mongo` + `server` | Database isolation — Mongo not reachable from nginx/client |
| `bbms-frontend` | `server` + `client` + `nginx` | Frontend traffic routing |

---

## 📦 Environment Variables

See [.env.docker](.env.docker) for the full list. Key variables:

| Variable | Description | Example |
|---|---|---|
| `JWT_SECRET` | JWT signing key (keep secret!) | `openssl rand -base64 64` |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | `strong_password` |
| `CLIENT_URL` | CORS allowed origin | `http://localhost` |
| `SMTP_*` | Email configuration | Gmail SMTP settings |
| `HTTP_PORT` | Host port for nginx | `80` |

---

## 🩺 Health Checks

All services have Docker health checks:

| Service | Check | Interval |
|---|---|---|
| `mongo` | `mongosh ping` | 30s |
| `server` | `GET /api/health` | 30s |
| `client` | `GET /` | 30s |
| `nginx` | `GET /nginx-health` | 30s |

Services start in dependency order: `mongo` → `server` → `client` → `nginx`

---

## 🔐 Security Notes

- MongoDB is **not exposed** on the host in production (internal only)
- Mongo Express is **disabled by default** — only available with `--profile tools`  
- Server runs as **non-root** (`bbms` user) inside the container
- Nginx enforces **rate limiting** on `/api/` (60 req/min) and `/api/auth/` (10 req/min)
- All secrets are passed via **environment variables**, never baked into images

---

## 🏥 Features (v2.0)

- **Multi-Branch** blood bank management with approval workflow
- **Real-time updates** via Socket.IO (inventory, requests, camps)
- **Automated inventory** — FIFO deduction on blood request approval
- **Scheduled jobs** — daily expiry check, 6-hourly low-stock alerts
- **Blood Bank Locator** — OpenStreetMap/Leaflet with nearby search
- **Donation Camps** — creation, registration, attendance tracking
- **Blood Transfers** — inter-branch transfers with inventory sync
- **Audit Logs** — full action trail for all operations
- **Analytics** — charts, branch performance, monthly trends
- **Component-aware cooling periods** (whole blood 90d, platelets 14d, plasma 28d)
