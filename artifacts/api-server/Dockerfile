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
COPY artifacts/api-server/src/ ./artifacts/api-server/src/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build the api-server
WORKDIR /app/artifacts/api-server
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy the bundled output from the builder
COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/api-server/package.json ./package.json

# Some dependencies might be externalized in build.mjs (like sharp or pg-native)
# But looking at build.mjs, most are standard. 
# If any external dependencies are needed, install them here.
# Since we are using standard postgres (pg), it's bundled.

EXPOSE 8080

CMD ["node", "./dist/index.mjs"]
