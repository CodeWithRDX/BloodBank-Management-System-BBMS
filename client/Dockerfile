# ─────────────────────────────────────────────
# Stage 1: Build the Vite React application
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install ALL deps (includes devDeps for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables baked into the bundle
ARG VITE_API_URL=/api
ARG VITE_SOCKET_URL=""
ARG VITE_GOOGLE_CLIENT_ID=""

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the production bundle
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve with Nginx
# ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Non-root: set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
