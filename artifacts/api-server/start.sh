#!/bin/sh

# Seed permissions
echo "Running permission seeder..."
node ./artifacts/api-server/dist/seed_permissions.mjs

# Start the application
echo "Starting Spacca POS API Server..."
node ./artifacts/api-server/dist/index.mjs
