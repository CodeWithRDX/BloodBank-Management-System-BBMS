# ─────────────────────────────────────────────
# Stage 1: Install dependencies
# ─────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─────────────────────────────────────────────
# Stage 2: Production image
# ─────────────────────────────────────────────
FROM node:22-alpine AS production

# Install dumb-init for proper signal handling (PID 1 safety)
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -S bbms && adduser -S bbms -G bbms

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=bbms:bbms . .

# Create uploads directory with correct permissions
RUN mkdir -p uploads && chown -R bbms:bbms uploads

# Switch to non-root user
USER bbms

# Expose API port
EXPOSE 5000

# Health check — verify the API is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
