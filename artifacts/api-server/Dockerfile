# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./

# Copy lib packages (needed for the build)
COPY lib/ ./lib/

# Copy the api-server package
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/api-server/tsconfig.json ./artifacts/api-server/
COPY artifacts/api-server/build.mjs ./artifacts/api-server/
COPY artifacts/api-server/start.sh ./artifacts/api-server/
COPY artifacts/api-server/src/ ./artifacts/api-server/src/
COPY scripts/ ./scripts/
COPY Inventory2026.csv ./Inventory2026.csv

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build the api-server
WORKDIR /app/artifacts/api-server
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine

# Install postgresql-client for pg_dump (used for backups)
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy the bundled output from the builder
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/api-server/package.json ./package.json
COPY --from=builder /app/artifacts/api-server/start.sh ./start.sh
COPY --from=builder /app/Inventory2026.csv ./Inventory2026.csv

# Ensure start.sh is executable
RUN chmod +x ./start.sh

EXPOSE 8080

CMD ["./start.sh"]
