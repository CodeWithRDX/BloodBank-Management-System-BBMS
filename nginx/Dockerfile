FROM nginx:1.27-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom reverse proxy config
# NOTE: We do NOT run `nginx -t` here.
# `upstream {}` blocks (or any hostname in proxy_pass) resolve at build time
# when the Docker network doesn't exist yet → build fails.
# Our config uses variables + resolver 127.0.0.11 (Docker DNS) to defer
# hostname resolution to request time, but nginx -t still tries to validate
# resolver reachability. So validation is left to runtime startup.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1/nginx-health || exit 1

CMD ["nginx", "-g", "daemon off;"]
