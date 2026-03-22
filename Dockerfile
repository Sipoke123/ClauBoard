# ---------------------------------------------------------------------------
# ClauBoard — multi-stage Docker build
# Stage 1: install deps + build
# Stage 2: production image (server + pre-built Next.js)
# ---------------------------------------------------------------------------

FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++
WORKDIR /app

# -- Install dependencies --
FROM base AS deps
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/server/package.json apps/server/tsconfig.json apps/server/
COPY apps/web/package.json apps/web/tsconfig.json apps/web/next.config.ts apps/web/postcss.config.mjs apps/web/
COPY packages/shared/package.json packages/shared/tsconfig.json packages/shared/tsconfig.build.json packages/shared/
RUN npm ci

# -- Build all packages --
FROM deps AS build
COPY packages/shared/src packages/shared/src
COPY apps/server/src apps/server/src
COPY apps/web/src apps/web/src
COPY apps/web/public apps/web/public
COPY apps/web/next-env.d.ts apps/web/
COPY apps/web/server-proxy.js apps/web/

# Build shared types, server, and Next.js
RUN npx turbo run build

# -- Production image --
FROM node:20-alpine AS production
RUN apk add --no-cache tini
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files for npm ci --production
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/

# Install production deps only
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=build /app/apps/server/dist apps/server/dist
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static apps/web/.next/static
COPY --from=build /app/apps/web/public apps/web/public
COPY --from=build /app/apps/web/server-proxy.js apps/web/server-proxy.js
COPY --from=build /app/packages/shared packages/shared

# Data directory for persistence
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# Expose ports: server (3001) + web (3000)
EXPOSE 3000 3001

# Start script runs both server and web
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["tini", "--"]
CMD ["/app/docker-entrypoint.sh"]
