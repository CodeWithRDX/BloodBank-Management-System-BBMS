# ══════════════════════════════════════════════════════════════════════════════
# BBMS Makefile — Developer convenience commands
# ══════════════════════════════════════════════════════════════════════════════

.PHONY: help setup prod prod-build dev dev-tools down down-clean \
        seed seed-destroy \
        db-shell db-admin db-admin-stop \
        logs logs-server logs-client logs-nginx logs-mongo \
        shell-server shell-client shell-nginx \
        mongo-backup mongo-restore \
        ps health lint-client

# Default
.DEFAULT_GOAL := help

# Load .env for use in make targets
-include .env
export

# ── Colors ─────────────────────────────────────────────────────────────────────
CYAN  := \033[36m
GREEN := \033[32m
YELLOW:= \033[33m
RED   := \033[31m
RESET := \033[0m
BOLD  := \033[1m

# ── Help ───────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "$(BOLD)$(CYAN)  🩸 BBMS Docker Commands$(RESET)"
	@echo "  ═══════════════════════════════════════════════════════"
	@echo ""
	@echo "$(BOLD)  Setup$(RESET)"
	@echo "  $(CYAN)make setup$(RESET)          Copy .env.docker → .env"
	@echo ""
	@echo "$(BOLD)  Production$(RESET)"
	@echo "  $(CYAN)make prod$(RESET)           Start all services (detached)"
	@echo "  $(CYAN)make prod-build$(RESET)     Rebuild all images + start"
	@echo "  $(CYAN)make down$(RESET)           Stop all services"
	@echo "  $(CYAN)make down-clean$(RESET)     Stop + delete ALL data volumes ⚠"
	@echo ""
	@echo "$(BOLD)  Development$(RESET)"
	@echo "  $(CYAN)make dev$(RESET)            Hot-reload dev (server + client)"
	@echo "  $(CYAN)make dev-build$(RESET)      Rebuild + hot-reload dev"
	@echo ""
	@echo "$(BOLD)  Database — Seeding$(RESET)"
	@echo "  $(CYAN)make seed$(RESET)           Seed demo data into the running DB"
	@echo "  $(CYAN)make seed-destroy$(RESET)   Wipe all data then re-seed ⚠"
	@echo ""
	@echo "$(BOLD)  Database — Access$(RESET)"
	@echo "  $(CYAN)make db-shell$(RESET)       Open mongosh inside the mongo container"
	@echo "  $(CYAN)make db-admin$(RESET)       Start Mongo Express UI at :8081 (secured)"
	@echo "  $(CYAN)make db-admin-stop$(RESET)  Stop Mongo Express UI"
	@echo ""
	@echo "$(BOLD)  Logs$(RESET)"
	@echo "  $(CYAN)make logs$(RESET)           Tail all service logs"
	@echo "  $(CYAN)make logs-server$(RESET)    Tail server logs"
	@echo "  $(CYAN)make logs-nginx$(RESET)     Tail nginx logs"
	@echo "  $(CYAN)make logs-mongo$(RESET)     Tail mongo logs"
	@echo ""
	@echo "$(BOLD)  Shells$(RESET)"
	@echo "  $(CYAN)make shell-server$(RESET)   sh inside server container"
	@echo "  $(CYAN)make shell-client$(RESET)   sh inside client container"
	@echo ""
	@echo "$(BOLD)  Backup & Restore$(RESET)"
	@echo "  $(CYAN)make mongo-backup$(RESET)   Dump DB to ./backups/"
	@echo "  $(CYAN)make mongo-restore FILE=backups/xxx.gz$(RESET)"
	@echo ""
	@echo "$(BOLD)  Other$(RESET)"
	@echo "  $(CYAN)make ps$(RESET)             Show container status"
	@echo "  $(CYAN)make health$(RESET)         Check API health endpoint"
	@echo ""

# ── Setup ──────────────────────────────────────────────────────────────────────
setup:
	@if [ ! -f .env ]; then \
		cp .env.docker .env; \
		echo "$(GREEN)✓ .env created from .env.docker — edit it with your values.$(RESET)"; \
	else \
		echo "$(YELLOW)⚠  .env already exists, skipping.$(RESET)"; \
	fi

# ── Production ─────────────────────────────────────────────────────────────────
prod:
	docker compose up -d
	@echo "$(GREEN)✓ All services started. App → http://localhost$(RESET)"

prod-build:
	docker compose build --no-cache
	docker compose up -d
	@echo "$(GREEN)✓ Rebuilt + started. App → http://localhost$(RESET)"

# ── Development ────────────────────────────────────────────────────────────────
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up

dev-build:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# ── Lifecycle ──────────────────────────────────────────────────────────────────
down:
	docker compose down

down-clean:
	@echo "$(RED)$(BOLD)⚠  WARNING: This deletes ALL database and upload volumes!$(RESET)"
	@echo -n "  Type 'yes' to confirm: " && read ans && [ "$$ans" = "yes" ]
	docker compose down -v
	@echo "$(GREEN)✓ All containers and volumes removed.$(RESET)"

# ══════════════════════════════════════════════════════════════════════════════
# DATABASE SEEDING
# ══════════════════════════════════════════════════════════════════════════════

# Run seeder.js inside the running server container
# Safe: won't overwrite if data already exists
seed:
	@echo "$(CYAN)▶ Running seeder inside server container...$(RESET)"
	@docker compose exec server node utils/seeder.js || \
		(echo "$(RED)✗ Server container is not running. Start it first: make prod$(RESET)" && exit 1)

# Wipe all data and re-seed from scratch
seed-destroy:
	@echo "$(RED)$(BOLD)⚠  This will DELETE all users, donors, inventory and re-seed!$(RESET)"
	@echo -n "  Type 'yes' to confirm: " && read ans && [ "$$ans" = "yes" ]
	@echo "$(CYAN)▶ Wiping data...$(RESET)"
	@docker compose exec server node utils/seeder.js --destroy
	@echo "$(CYAN)▶ Re-seeding...$(RESET)"
	@docker compose exec server node utils/seeder.js

# ══════════════════════════════════════════════════════════════════════════════
# DATABASE ACCESS
# ══════════════════════════════════════════════════════════════════════════════

# Open an interactive mongosh shell inside the running mongo container
db-shell:
	@echo "$(CYAN)▶ Opening mongosh (bloodbank database)...$(RESET)"
	@echo "$(CYAN)  Tip: type 'show collections', 'db.users.find()' etc.$(RESET)"
	@echo "$(CYAN)  Type 'exit' or Ctrl+C to quit.$(RESET)\n"
	docker compose exec mongo mongosh \
		"mongodb://$(MONGO_ROOT_USER):$(MONGO_ROOT_PASSWORD)@localhost:27017/$(MONGO_DB)?authSource=admin" \
		--quiet

# Start the Mongo Express web UI (secured with basic auth)
# Runs in foreground — press Ctrl+C to stop
db-admin:
	@echo "$(CYAN)▶ Starting Mongo Express DB admin UI...$(RESET)"
	@echo "$(GREEN)  URL:      http://localhost:$(MONGO_EXPRESS_PORT)$(RESET)"
	@echo "$(GREEN)  User:     $(MONGO_EXPRESS_USER)$(RESET)"
	@echo "$(GREEN)  Password: (from your .env MONGO_EXPRESS_PASS)$(RESET)"
	@echo "$(YELLOW)  Press Ctrl+C to stop.$(RESET)\n"
	docker compose --profile tools up mongo-express

# Stop Mongo Express if running in background
db-admin-stop:
	docker compose stop mongo-express
	docker compose rm -f mongo-express

# ══════════════════════════════════════════════════════════════════════════════
# LOGS
# ══════════════════════════════════════════════════════════════════════════════
logs:
	docker compose logs -f

logs-server:
	docker compose logs -f server

logs-client:
	docker compose logs -f client

logs-nginx:
	docker compose logs -f nginx

logs-mongo:
	docker compose logs -f mongo

# ══════════════════════════════════════════════════════════════════════════════
# SHELLS
# ══════════════════════════════════════════════════════════════════════════════
shell-server:
	docker compose exec server sh

shell-client:
	docker compose exec client sh

shell-nginx:
	docker compose exec nginx sh

# ══════════════════════════════════════════════════════════════════════════════
# STATUS & HEALTH
# ══════════════════════════════════════════════════════════════════════════════
ps:
	@docker compose ps

health:
	@echo "$(CYAN)▶ Checking API health...$(RESET)"
	@curl -sf http://localhost/api/health | python3 -m json.tool 2>/dev/null || \
		curl -sf http://localhost:5000/api/health | python3 -m json.tool 2>/dev/null || \
		echo "$(RED)✗ API not reachable$(RESET)"

# ══════════════════════════════════════════════════════════════════════════════
# BACKUP & RESTORE
# ══════════════════════════════════════════════════════════════════════════════
mongo-backup:
	@mkdir -p backups
	$(eval TIMESTAMP := $(shell date +%Y%m%d_%H%M%S))
	@echo "$(CYAN)▶ Dumping $(MONGO_DB) → backups/$(MONGO_DB)_$(TIMESTAMP).gz$(RESET)"
	@docker compose exec -T mongo mongodump \
		--uri="mongodb://$(MONGO_ROOT_USER):$(MONGO_ROOT_PASSWORD)@localhost:27017/$(MONGO_DB)?authSource=admin" \
		--archive \
		| gzip > backups/$(MONGO_DB)_$(TIMESTAMP).gz
	@echo "$(GREEN)✓ Backup saved: backups/$(MONGO_DB)_$(TIMESTAMP).gz$(RESET)"

mongo-restore:
	@test -n "$(FILE)" || (echo "$(RED)Usage: make mongo-restore FILE=backups/bloodbank_YYYYMMDD.gz$(RESET)" && exit 1)
	@echo "$(YELLOW)⚠  Restoring from $(FILE) — this may overwrite existing data$(RESET)"
	@echo -n "  Type 'yes' to confirm: " && read ans && [ "$$ans" = "yes" ]
	gunzip -c $(FILE) | docker compose exec -T mongo mongorestore \
		--uri="mongodb://$(MONGO_ROOT_USER):$(MONGO_ROOT_PASSWORD)@localhost:27017/?authSource=admin" \
		--archive \
		--drop
	@echo "$(GREEN)✓ Restore complete.$(RESET)"

# ── Lint ───────────────────────────────────────────────────────────────────────
lint-client:
	cd client && npm run lint
