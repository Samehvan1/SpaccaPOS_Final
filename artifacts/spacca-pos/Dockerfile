# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy lib packages (needed for the build)
COPY lib/ ./lib/

# Copy the frontend package
COPY artifacts/spacca-pos/package.json ./artifacts/spacca-pos/
COPY artifacts/spacca-pos/tsconfig.json ./artifacts/spacca-pos/
COPY artifacts/spacca-pos/vite.config.ts ./artifacts/spacca-pos/
COPY artifacts/spacca-pos/index.html ./artifacts/spacca-pos/
COPY artifacts/spacca-pos/src/ ./artifacts/spacca-pos/src/
COPY artifacts/spacca-pos/public/ ./artifacts/spacca-pos/public/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the frontend
# We pass the production API URL here
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app/artifacts/spacca-pos
RUN pnpm run build

# Stage 2: Production (Nginx)
FROM nginx:alpine

# Copy custom nginx config
# We will create this file next
COPY artifacts/spacca-pos/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files from builder
COPY --from=builder /app/artifacts/spacca-pos/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
